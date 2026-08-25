import { describe, expect, it } from "vitest";
import { cardAssets, generationJobs, validateManifest } from "../src/asset-manifest.js";

const manifest = {
  schema_version: 1,
  tile_size: 16,
  style_prompt: "Original RPG pixel art",
  assets: [{
    id: "lamp", name: "Lamp", width: 1, height: 2,
    prompt: "A floor lamp", states: { default: {}, on: { prompt: "Warm glow" } },
  }],
};

describe("AI asset manifest", () => {
  it("expands state variants into provider-neutral jobs", () => {
    const jobs = generationJobs(manifest);
    expect(jobs).toHaveLength(2);
    expect(jobs[1]).toMatchObject({ output: "lamp-on.png", size: "1024x1024" });
    expect(jobs[1].prompt).toContain("Warm glow");
  });

  it("creates card asset configuration", () => {
    expect(cardAssets(manifest, "/local/home-rpg")[0]).toMatchObject({
      id: "lamp", width: 1, height: 2,
      images: { default: "/local/home-rpg/lamp-default.png", on: "/local/home-rpg/lamp-on.png" },
    });
  });

  it("rejects unsafe and duplicate ids", () => {
    expect(() => validateManifest({ ...manifest, assets: [{ ...manifest.assets[0], id: "../lamp" }] })).toThrow(/Invalid asset id/);
    expect(() => validateManifest({ ...manifest, assets: [manifest.assets[0], manifest.assets[0]] })).toThrow(/Duplicate asset id/);
  });
});
