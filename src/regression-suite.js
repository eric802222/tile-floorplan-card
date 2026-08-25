import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { compareImages } from "./visual-regression.js";

const safeImageName = (value) => {
  const name = basename(String(value || ""));
  if (!/^[a-z0-9][a-z0-9_.-]*\.png$/i.test(name) || name !== value) throw new Error(`Unsafe scenario image name: ${value}`);
  return name;
};

export async function compareScenarioSuite(scenarioReport, options) {
  if (scenarioReport?.kind !== "scenario-render" || !Array.isArray(scenarioReport.scenarios)) {
    throw new Error("Input must be a scenario-render report");
  }
  const actualDir = resolve(options.actualDir);
  const baselineDir = resolve(options.baselineDir);
  const diffDir = resolve(options.diffDir);
  await mkdir(diffDir, { recursive: true });
  let baselineEntries = [];
  try {
    baselineEntries = await readdir(baselineDir);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const baselineFiles = new Set(baselineEntries.filter((name) => name.toLowerCase().endsWith(".png")));
  const expectedFiles = new Set();
  const scenarios = [];

  for (const scenario of scenarioReport.scenarios) {
    const image = safeImageName(scenario.image || `${scenario.id}.png`);
    expectedFiles.add(image);
    if (!baselineFiles.has(image)) {
      scenarios.push({ id: scenario.id, image, passed: false, code: "missing_baseline" });
      continue;
    }
    try {
      const result = await compareImages(
        await readFile(join(actualDir, image)),
        await readFile(join(baselineDir, image)),
        { threshold: options.threshold, maxRatio: options.maxRatio },
      );
      const diffImage = `${scenario.id}.diff.png`;
      await writeFile(join(diffDir, diffImage), result.diff);
      scenarios.push({ id: scenario.id, image, diff_image: diffImage, ...result.report });
    } catch (error) {
      scenarios.push({ id: scenario.id, image, passed: false, code: "comparison_error", message: error.message });
    }
  }

  const staleBaselines = [...baselineFiles].filter((name) => !expectedFiles.has(name)).sort();
  return {
    kind: "visual-regression-suite",
    passed: scenarios.length > 0 && scenarios.every((scenario) => scenario.passed),
    scenarios,
    stale_baselines: staleBaselines,
    summary: {
      total: scenarios.length,
      passed: scenarios.filter((scenario) => scenario.passed).length,
      failed: scenarios.filter((scenario) => !scenario.passed).length,
      missing_baselines: scenarios.filter((scenario) => scenario.code === "missing_baseline").length,
      stale_baselines: staleBaselines.length,
    },
  };
}
