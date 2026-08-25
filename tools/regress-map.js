#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { compareScenarioSuite } from "../src/regression-suite.js";

const args = process.argv.slice(2);
const valueAfter = (flag, fallback) => { const index = args.indexOf(flag); return index >= 0 ? args[index + 1] : fallback; };
const reportPath = resolve(valueAfter("--scenarios-report", "map-scenarios/scenarios.report.json"));
const actualDir = resolve(valueAfter("--actual-dir", dirname(reportPath)));
const outputPath = resolve(valueAfter("--report", "map-regression.report.json"));
const result = await compareScenarioSuite(JSON.parse(await readFile(reportPath, "utf8")), {
  actualDir,
  baselineDir: resolve(valueAfter("--baseline-dir", "baselines")),
  diffDir: resolve(valueAfter("--diff-dir", "map-diffs")),
  threshold: Number(valueAfter("--threshold", "0")),
  maxRatio: Number(valueAfter("--max-ratio", "0")),
});
await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(`${result.summary.passed}/${result.summary.total} scenarios passed; wrote ${outputPath}`);
if (!result.passed) process.exitCode = 1;
