import { copyFile, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { validateMapConfig } from "./validation.js";

const clone = (value) => JSON.parse(JSON.stringify(value));

async function loadEditableMap(mapPath) {
  const path = resolve(mapPath);
  const source = JSON.parse(await readFile(path, "utf8"));
  if (extname(path) === ".tmj" || source.type === "map") {
    throw new Error("Object mutations currently require Card JSON; import Tiled TMJ before editing");
  }
  if (!Array.isArray(source.objects)) source.objects = [];
  return { path, source };
}

const findObject = (objects, id) => {
  const index = objects.findIndex((object) => object.id === id);
  if (index < 0) throw new Error(`Object not found: ${id}`);
  return index;
};

export async function editMapObject(mapPath, operation, options = {}) {
  const { path, source } = await loadEditableMap(mapPath);
  const beforeConfig = clone(source);
  let before = null;
  let after = null;

  if (operation === "add") {
    const object = clone(options.object);
    if (!object?.id) throw new Error("New object needs a non-empty id");
    if (source.objects.some((item) => item.id === object.id)) throw new Error(`Duplicate object id: ${object.id}`);
    source.objects.push(object);
    after = clone(object);
  } else if (operation === "move") {
    const index = findObject(source.objects, options.id);
    before = clone(source.objects[index]);
    source.objects[index].x = Number(options.x);
    source.objects[index].y = Number(options.y);
    after = clone(source.objects[index]);
  } else if (operation === "resize") {
    const index = findObject(source.objects, options.id);
    before = clone(source.objects[index]);
    source.objects[index].width = Number(options.width);
    source.objects[index].height = Number(options.height);
    after = clone(source.objects[index]);
  } else if (operation === "remove") {
    const index = findObject(source.objects, options.id);
    before = clone(source.objects[index]);
    source.objects.splice(index, 1);
  } else {
    throw new Error(`Unsupported object operation: ${operation}`);
  }

  const validation = validateMapConfig(source);
  const report = {
    kind: "map-object-edit",
    passed: validation.passed,
    operation: `object.${operation}`,
    map: path,
    written: false,
    backup: null,
    before,
    after,
    validation,
  };
  if (!validation.passed || !options.write) return report;

  const backupPath = `${path}.bak`;
  const temporaryPath = join(dirname(path), `.${Date.now()}-${Math.random().toString(16).slice(2)}.tmp`);
  await copyFile(path, backupPath);
  try {
    await writeFile(temporaryPath, `${JSON.stringify(source, null, 2)}\n`, { flag: "wx" });
    await rename(temporaryPath, path);
  } catch (error) {
    await copyFile(backupPath, path);
    throw error;
  }
  report.written = true;
  report.backup = backupPath;
  report.previous = beforeConfig.objects.length;
  report.current = source.objects.length;
  return report;
}
