#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { validateAssetFiles } from "../src/validation.js";

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const reportIndex = args.indexOf("--report");
const reportPath = reportIndex >= 0 ? resolve(args[reportIndex + 1]) : null;
const positional = args.filter((arg, index) => !arg.startsWith("--") && index !== reportIndex + 1);
const manifestPath = resolve(positional[0] || "assets/manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const outputDir = resolve(dirname(manifestPath), manifest.output_dir || "generated");
const report = await validateAssetFiles(manifest, outputDir, { strict });
const json = `${JSON.stringify(report, null, 2)}\n`;
if (reportPath) await writeFile(reportPath, json);
process.stdout.write(json);
if (!report.passed) process.exitCode = 1;
