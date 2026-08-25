import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { createContactSheet, processAsset } from "../src/postprocess.js";

describe("asset post-processing", () => {
  it("removes chroma, snaps alpha and creates the logical canvas", async () => {
    const background = await sharp({
      create: { width: 64, height: 64, channels: 4, background: { r: 255, g: 0, b: 255, alpha: 1 } },
    }).composite([{
      input: Buffer.from(`<svg width="20" height="30"><rect width="20" height="30" fill="#3060a0"/></svg>`),
      left: 22, top: 20,
    }]).png().toBuffer();
    const result = await processAsset(background, { width: 1, height: 2, tileSize: 16, maxColors: 16 });
    const metadata = await sharp(result).metadata();
    const { data, info } = await sharp(result).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const alphas = new Set();
    for (let offset = 3; offset < data.length; offset += info.channels) alphas.add(data[offset]);
    expect(metadata).toMatchObject({ width: 16, height: 32, format: "png", hasAlpha: true });
    expect([...alphas].sort((a, b) => a - b)).toEqual([0, 255]);
  });

  it("builds a labelled visual review sheet", async () => {
    const sprite = await sharp({
      create: { width: 16, height: 16, channels: 4, background: { r: 20, g: 80, b: 40, alpha: 1 } },
    }).png().toBuffer();
    const sheet = await createContactSheet([
      { label: "plant · default", input: sprite },
      { label: "lamp · on", input: sprite },
    ], { columns: 2, cellWidth: 120, cellHeight: 100 });
    expect(await sharp(sheet).metadata()).toMatchObject({ width: 240, height: 100, format: "png" });
  });
});
