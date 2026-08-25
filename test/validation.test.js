import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { validateAssetFiles, validateMapConfig } from "../src/validation.js";

describe("production validation", () => {
  it("accepts a grid-sized transparent PNG", async () => {
    const directory = await mkdtemp(join(tmpdir(), "floorplan-assets-"));
    const bytes = await sharp({
      create: { width: 16, height: 16, channels: 4, background: { r: 32, g: 96, b: 64, alpha: 1 } },
    }).png().toBuffer();
    await writeFile(join(directory, "plant-default.png"), bytes);
    const report = await validateAssetFiles({
      schema_version: 1, tile_size: 16, style_prompt: "RPG pixel art",
      assets: [{ id: "plant", width: 1, height: 1, prompt: "Plant", states: { default: {} } }],
    }, directory, { strict: true });
    expect(report.passed).toBe(true);
    expect(report.files[0]).toMatchObject({ width: 16, height: 16, has_alpha: true });
  });

  it("reports missing state files", async () => {
    const directory = await mkdtemp(join(tmpdir(), "floorplan-assets-"));
    const report = await validateAssetFiles({
      schema_version: 1, style_prompt: "RPG pixel art",
      assets: [{ id: "lamp", width: 1, height: 2, prompt: "Lamp", states: { default: {}, on: {} } }],
    }, directory);
    expect(report.passed).toBe(false);
    expect(report.errors.map(error => error.code)).toEqual(["missing_file", "missing_file"]);
  });

  it("finds broken map references and geometry", () => {
    const report = validateMapConfig({
      grid: { width: 10, height: 8 },
      assets: [{ id: "lamp", width: 1, height: 2, images: { default: "lamp.png" } }],
      objects: [
        { id: "lamp-1", asset_id: "missing", x: 9, y: 7, width: 2, height: 2, tap_action: { action: "warp" } },
        { id: "lamp-1", entity_id: "Bad Entity", x: 0, y: 0, width: 1, height: 1 },
      ],
    });
    expect(report.passed).toBe(false);
    expect(new Set(report.errors.map(error => error.code))).toEqual(new Set([
      "unknown_asset", "out_of_bounds", "invalid_action", "duplicate_object_id", "invalid_entity_id",
    ]));
  });
});
