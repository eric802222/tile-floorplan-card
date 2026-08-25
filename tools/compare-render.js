#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { compareImages } from "../src/visual-regression.js";

const args = process.argv.slice(2);
const valueAfter = (flag, fallback) => { const index = args.indexOf(flag); return index >= 0 ? args[index + 1] : fallback; };
const positional = args.filter((arg, index) => !arg.startsWith("--") && !["--diff", "--report", "--threshold", "--max-ratio"].includes(args[index - 1]));
if (!positional[0] || !positional[1]) throw new Error("Usage: npm run map:diff -- <actual.png> <baseline.png> [--max-ratio 0] [--threshold 0]");
const actualPath = resolve(positional[0]);
const baselinePath = resolve(positional[1]);
const diffPath = resolve(valueAfter("--diff", `${actualPath}.diff.png`));
const reportPath = resolve(valueAfter("--report", `${actualPath}.diff.json`));
const result = await compareImages(await readFile(actualPath), await readFile(baselinePath), {
  threshold: Number(valueAfter("--threshold", "0")), maxRatio: Number(valueAfter("--max-ratio", "0")),
});
await writeFile(diffPath, result.diff);
await writeFile(reportPath, `${JSON.stringify(result.report, null, 2)}\n`);
console.log(`Changed ${(result.report.changed_ratio * 100).toFixed(4)}%; wrote ${diffPath} and ${reportPath}`);
if (!result.report.passed) process.exitCode = 1;
