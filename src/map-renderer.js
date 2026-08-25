import { readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import sharp from "sharp";
import { imageForObject, resolveObject } from "./config.js";

export function resolveLocalAsset(reference, wwwRoot) {
  if (!reference) return null;
  if (/^https?:\/\//i.test(reference) || reference.startsWith("data:")) return null;
  const relativeReference = reference.startsWith("/local/")
    ? reference.slice("/local/".length)
    : reference.replace(/^\.\//, "").replace(/^\//, "");
  const root = resolve(wwwRoot);
  const candidate = resolve(root, relativeReference);
  const pathFromRoot = relative(root, candidate);
  if (isAbsolute(pathFromRoot) || pathFromRoot.startsWith("..")) throw new Error(`Asset path escapes www root: ${reference}`);
  return candidate;
}

const fakeHass = (states = {}) => ({
  states: Object.fromEntries(Object.entries(states).map(([entityId, value]) => [
    entityId,
    typeof value === "object" ? value : { state: String(value) },
  ])),
});

const gridOverlay = (width, height, tileSize) => Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="${tileSize}" height="${tileSize}" patternUnits="userSpaceOnUse"><path d="M ${tileSize} 0 L 0 0 0 ${tileSize}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>`);

export async function renderMap(config, options = {}) {
  const tileSize = Number(config.grid?.tile_size || 16);
  const width = Number(config.grid?.width) * tileSize;
  const height = Number(config.grid?.height) * tileSize;
  if (!(width > 0) || !(height > 0)) throw new Error("Map grid dimensions must be positive");
  const wwwRoot = resolve(options.wwwRoot || ".");
  const report = { kind: "map-render", passed: true, errors: [], warnings: [], placed: [], skipped: [] };
  const composites = [];

  if (config.grid?.background) {
    const path = resolveLocalAsset(config.grid.background, wwwRoot);
    if (!path) report.errors.push({ code: "remote_background", reference: config.grid.background });
    else {
      try {
        const input = await readFile(path);
        composites.push({ input: await sharp(input).resize(width, height, { fit: "fill", kernel: "nearest" }).png().toBuffer(), left: 0, top: 0 });
      } catch (error) {
        report.errors.push({ code: "background_unreadable", reference: config.grid.background, message: error.message });
      }
    }
  }

  const hass = fakeHass(options.states);
  const objects = [...(config.objects || [])].filter((object) => object.visible !== false).sort((a, b) => Number(a.z || 0) - Number(b.z || 0));
  for (const original of objects) {
    const object = resolveObject(original, config.assets || []);
    const reference = imageForObject(object, hass);
    if (!reference) {
      report.skipped.push({ object_id: object.id, code: "no_image" });
      continue;
    }
    const path = resolveLocalAsset(reference, wwwRoot);
    if (!path) {
      report.errors.push({ object_id: object.id, code: "remote_image", reference });
      report.skipped.push({ object_id: object.id, code: "remote_image" });
      continue;
    }
    try {
      const objectWidth = Math.max(1, Math.round(Number(object.width || 1) * tileSize));
      const objectHeight = Math.max(1, Math.round(Number(object.height || 1) * tileSize));
      const input = await readFile(path);
      const sprite = await sharp(input).resize(objectWidth, objectHeight, { fit: "fill", kernel: "nearest" }).png().toBuffer();
      const left = Math.round(Number(object.x || 0) * tileSize);
      const top = Math.round(Number(object.y || 0) * tileSize);
      composites.push({ input: sprite, left, top });
      report.placed.push({ object_id: object.id, reference, state: object.entity_id ? hass.states[object.entity_id]?.state : undefined, bounds: [left, top, objectWidth, objectHeight] });
    } catch (error) {
      report.errors.push({ object_id: object.id, code: "image_unreadable", reference, message: error.message });
    }
  }

  if (options.showGrid) composites.push({ input: gridOverlay(width, height, tileSize), left: 0, top: 0 });
  report.passed = report.errors.length === 0;
  const logical = await sharp({ create: { width, height, channels: 4, background: options.background || { r: 245, g: 242, b: 225, alpha: 1 } } })
    .composite(composites).png().toBuffer();
  const scale = Math.max(1, Number(options.scale || 1));
  const buffer = scale === 1
    ? logical
    : await sharp(logical).resize(Math.round(width * scale), Math.round(height * scale), { kernel: "nearest" }).png().toBuffer();
  return { buffer, report };
}
