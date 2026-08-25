import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { editMapObject } from "../src/map-editor.js";

const fixture = { grid: { width: 5, height: 5, tile_size: 16 }, objects: [{ id: "lamp", x: 1, y: 1, width: 1, height: 1, images: { default: "lamp.png" } }] };

describe("safe map object editing", () => {
  it("is dry-run by default", async () => {
    const root = await mkdtemp(join(tmpdir(), "map-edit-"));
    const path = join(root, "map.json");
    await writeFile(path, JSON.stringify(fixture));
    const result = await editMapObject(path, "move", { id: "lamp", x: 2, y: 3 });
    expect(result).toMatchObject({ passed: true, written: false, before: { x: 1, y: 1 }, after: { x: 2, y: 3 } });
    expect(JSON.parse(await readFile(path, "utf8")).objects[0]).toMatchObject({ x: 1, y: 1 });
  });

  it("writes atomically and creates a backup when authorized", async () => {
    const root = await mkdtemp(join(tmpdir(), "map-edit-"));
    const path = join(root, "map.json");
    await writeFile(path, JSON.stringify(fixture));
    const result = await editMapObject(path, "resize", { id: "lamp", width: 2, height: 2, write: true });
    expect(result).toMatchObject({ passed: true, written: true, before: { width: 1 }, after: { width: 2 } });
    expect(JSON.parse(await readFile(path, "utf8")).objects[0]).toMatchObject({ width: 2, height: 2 });
    expect(JSON.parse(await readFile(`${path}.bak`, "utf8")).objects[0]).toMatchObject({ width: 1, height: 1 });
  });

  it("refuses invalid geometry without changing the map", async () => {
    const root = await mkdtemp(join(tmpdir(), "map-edit-"));
    const path = join(root, "map.json");
    await writeFile(path, JSON.stringify(fixture));
    const result = await editMapObject(path, "move", { id: "lamp", x: 9, y: 9, write: true });
    expect(result).toMatchObject({ passed: false, written: false, validation: { errors: [{ code: "out_of_bounds" }] } });
    expect(JSON.parse(await readFile(path, "utf8")).objects[0]).toMatchObject({ x: 1, y: 1 });
  });
});
