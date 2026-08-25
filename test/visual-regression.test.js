import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { compareImages, validateScenarios } from "../src/visual-regression.js";

const png = (color, width = 4, height = 4) => sharp({ create: { width, height, channels: 4, background: color } }).png().toBuffer();

describe("scenario validation", () => {
  it("normalizes names and states", () => {
    expect(validateScenarios({ scenarios: [{ id: "all-off" }] })).toEqual([{ id: "all-off", name: "all-off", states: {} }]);
  });
  it("rejects duplicate and unsafe ids", () => {
    expect(() => validateScenarios({ scenarios: [{ id: "../bad" }] })).toThrow(/Invalid scenario/);
    expect(() => validateScenarios({ scenarios: [{ id: "day" }, { id: "day" }] })).toThrow(/Duplicate/);
  });
});

describe("visual comparison", () => {
  it("passes identical images", async () => {
    const image = await png("#102030ff");
    const result = await compareImages(image, image);
    expect(result.report).toMatchObject({ passed: true, dimensions_match: true, changed_pixels: 0, changed_ratio: 0, bounds: null });
  });
  it("reports changed pixels and their bounding box", async () => {
    const baseline = await png("#000000ff");
    const actual = await sharp(baseline).composite([{ input: Buffer.from('<svg width="1" height="1"><rect width="1" height="1" fill="#ffffff"/></svg>'), left: 2, top: 1 }]).png().toBuffer();
    const result = await compareImages(actual, baseline, { maxRatio: 0.1 });
    expect(result.report).toMatchObject({ passed: true, changed_pixels: 1, changed_ratio: 1 / 16, bounds: { left: 2, top: 1, width: 1, height: 1 } });
  });
  it("fails dimension changes", async () => {
    const result = await compareImages(await png("#000000ff", 3, 4), await png("#000000ff", 4, 4));
    expect(result.report).toMatchObject({ passed: false, dimensions_match: false, changed_ratio: 1 });
  });
});
