import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { compareScenarioSuite } from "../src/regression-suite.js";

const png = (color) => sharp({ create: { width: 4, height: 4, channels: 4, background: color } }).png().toBuffer();

const setup = async () => {
  const root = await mkdtemp(join(tmpdir(), "map-regression-"));
  const actualDir = join(root, "actual");
  const baselineDir = join(root, "baseline");
  const diffDir = join(root, "diff");
  await Promise.all([mkdir(actualDir), mkdir(baselineDir)]);
  return { actualDir, baselineDir, diffDir };
};

describe("visual regression suite", () => {
  it("compares every rendered scenario and writes diffs", async () => {
    const paths = await setup();
    const image = await png("#204060ff");
    await Promise.all([writeFile(join(paths.actualDir, "day.png"), image), writeFile(join(paths.baselineDir, "day.png"), image)]);
    const result = await compareScenarioSuite({ kind: "scenario-render", scenarios: [{ id: "day", image: "day.png" }] }, paths);
    expect(result).toMatchObject({ passed: true, summary: { total: 1, passed: 1, failed: 0, missing_baselines: 0 } });
    expect((await readFile(join(paths.diffDir, "day.diff.png"))).length).toBeGreaterThan(0);
  });

  it("fails missing baselines and reports stale ones", async () => {
    const paths = await setup();
    await writeFile(join(paths.baselineDir, "old.png"), await png("#000000ff"));
    const result = await compareScenarioSuite({ kind: "scenario-render", scenarios: [{ id: "night", image: "night.png" }] }, paths);
    expect(result).toMatchObject({ passed: false, stale_baselines: ["old.png"], summary: { failed: 1, missing_baselines: 1, stale_baselines: 1 } });
  });

  it("rejects image paths outside the scenario directory", async () => {
    const paths = await setup();
    await expect(compareScenarioSuite({ kind: "scenario-render", scenarios: [{ id: "bad", image: "../bad.png" }] }, paths)).rejects.toThrow(/Unsafe/);
  });

  it("reports all baselines missing when the baseline directory does not exist", async () => {
    const paths = await setup();
    const result = await compareScenarioSuite(
      { kind: "scenario-render", scenarios: [{ id: "away", image: "away.png" }] },
      { ...paths, baselineDir: join(paths.baselineDir, "missing") },
    );
    expect(result).toMatchObject({ passed: false, summary: { total: 1, missing_baselines: 1 } });
  });
});
