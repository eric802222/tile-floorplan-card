import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { importTiled } from "./tiled.js";

export async function loadMapConfig(path) {
  const inputPath = resolve(path);
  const source = JSON.parse(await readFile(inputPath, "utf8"));
  const config = extname(inputPath) === ".tmj" || source.type === "map" ? importTiled(source) : source;
  return { inputPath, config };
}

export function summarizeMap(config) {
  const entities = [...new Set((config.objects || []).map((object) => object.entity_id).filter(Boolean))].sort();
  return {
    grid: {
      width: Number(config.grid?.width || 0),
      height: Number(config.grid?.height || 0),
      tile_size: Number(config.grid?.tile_size || 16),
    },
    assets: (config.assets || []).length,
    objects: (config.objects || []).length,
    entities,
  };
}
