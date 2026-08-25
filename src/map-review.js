import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { loadMapConfig, summarizeMap } from "./map-io.js";
import { renderMap } from "./map-renderer.js";
import { createContactSheet } from "./postprocess.js";
import { compareScenarioSuite } from "./regression-suite.js";
import { validateMapConfig } from "./validation.js";
import { validateScenarios } from "./visual-regression.js";

export async function reviewMap(options) {
  const { inputPath, config } = await loadMapConfig(options.mapPath);
  const validation = validateMapConfig(config);
  const report = {
    kind: "map-review",
    passed: false,
    map: inputPath,
    summary: summarizeMap(config),
    validation,
    render: null,
    regression: null,
  };
  if (!validation.passed) return { report, overviewPath: null };

  const scenarioPath = resolve(options.scenarioPath);
  const scenarios = validateScenarios(JSON.parse(await readFile(scenarioPath, "utf8")));
  const outputDir = resolve(options.outputDir || "map-review");
  await mkdir(outputDir, { recursive: true });
  const items = [];
  const rendered = [];
  for (const scenario of scenarios) {
    const result = await renderMap(config, {
      wwwRoot: resolve(options.wwwRoot || "."),
      states: scenario.states,
      scale: Number(options.scale || 4),
      showGrid: Boolean(options.showGrid),
    });
    const image = `${scenario.id}.png`;
    await writeFile(join(outputDir, image), result.buffer);
    await writeFile(join(outputDir, `${scenario.id}.report.json`), `${JSON.stringify(result.report, null, 2)}\n`);
    items.push({ label: scenario.name, input: result.buffer });
    rendered.push({ id: scenario.id, name: scenario.name, image, passed: result.report.passed });
  }
  const overviewPath = join(outputDir, "overview.png");
  await writeFile(overviewPath, await createContactSheet(items, {
    columns: Number(options.columns || 2), cellWidth: 360, cellHeight: 300,
  }));
  const scenarioReport = {
    kind: "scenario-render",
    map: inputPath,
    passed: rendered.every((scenario) => scenario.passed),
    scenarios: rendered,
  };
  await writeFile(join(outputDir, "scenarios.report.json"), `${JSON.stringify(scenarioReport, null, 2)}\n`);
  report.render = scenarioReport;

  if (options.baselineDir) {
    report.regression = await compareScenarioSuite(scenarioReport, {
      actualDir: outputDir,
      baselineDir: resolve(options.baselineDir),
      diffDir: resolve(options.diffDir || join(outputDir, "diffs")),
      threshold: Number(options.threshold || 0),
      maxRatio: Number(options.maxRatio || 0),
    });
  }
  report.passed = validation.passed && scenarioReport.passed && (!report.regression || report.regression.passed);
  await writeFile(join(outputDir, "review.report.json"), `${JSON.stringify(report, null, 2)}\n`);
  return { report, overviewPath };
}
