import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { reviewMap } from "../src/map-review.js";

describe("local map review", () => {
  it("validates, renders scenarios, and compares baselines in one call", async () => {
    const root = await mkdtemp(join(tmpdir(), "map-review-"));
    const www = join(root, "www");
    const output = join(root, "output");
    const baselines = join(root, "baselines");
    await Promise.all([mkdir(join(www, "rpg"), { recursive: true }), mkdir(baselines)]);
    const sprite = await sharp({ create: { width: 16, height: 16, channels: 4, background: "#ffcc00ff" } }).png().toBuffer();
    await writeFile(join(www, "rpg/lamp.png"), sprite);
    const mapPath = join(root, "card.json");
    const scenarioPath = join(root, "scenarios.json");
    await writeFile(mapPath, JSON.stringify({ grid: { width: 1, height: 1, tile_size: 16 }, objects: [{ id: "lamp", x: 0, y: 0, width: 1, height: 1, images: { default: "/local/rpg/lamp.png" } }] }));
    await writeFile(scenarioPath, JSON.stringify({ scenarios: [{ id: "default", states: {} }] }));
    await writeFile(join(baselines, "default.png"), sprite);
    const result = await reviewMap({ mapPath, wwwRoot: www, scenarioPath, outputDir: output, baselineDir: baselines, scale: 1 });
    expect(result.report).toMatchObject({ passed: true, summary: { objects: 1 }, render: { passed: true }, regression: { passed: true } });
    expect(result.overviewPath).toBe(join(output, "overview.png"));
  });
});
