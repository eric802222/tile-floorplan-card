#!/usr/bin/env node
import { resolve } from "node:path";
import { reviewMap } from "../src/map-review.js";

const args = process.argv.slice(2);
const valueAfter = (flag, fallback) => { const index = args.indexOf(flag); return index >= 0 ? args[index + 1] : fallback; };
const flags = ["--www-root", "--scenarios", "--output-dir", "--baseline-dir", "--diff-dir", "--scale", "--columns", "--threshold", "--max-ratio"];
const positional = args.filter((arg, index) => !arg.startsWith("--") && !flags.includes(args[index - 1]));
if (!positional[0]) throw new Error("Usage: npm run map:review -- <card.json|map.tmj> --www-root <config/www> --scenarios <scenarios.json> [--baseline-dir baselines]");
const baseline = valueAfter("--baseline-dir");
const result = await reviewMap({
  mapPath: resolve(positional[0]),
  wwwRoot: resolve(valueAfter("--www-root", ".")),
  scenarioPath: resolve(valueAfter("--scenarios", "assets/scenarios.json")),
  outputDir: resolve(valueAfter("--output-dir", "map-review")),
  baselineDir: baseline ? resolve(baseline) : undefined,
  diffDir: resolve(valueAfter("--diff-dir", "map-review/diffs")),
  scale: Number(valueAfter("--scale", "4")),
  columns: Number(valueAfter("--columns", "2")),
  threshold: Number(valueAfter("--threshold", "0")),
  maxRatio: Number(valueAfter("--max-ratio", "0")),
  showGrid: args.includes("--show-grid"),
});
console.log(JSON.stringify(result.report, null, 2));
if (!result.report.passed) process.exitCode = 1;
