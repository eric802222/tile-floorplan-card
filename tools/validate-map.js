#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { importTiled } from "../src/tiled.js";
import { validateMapConfig } from "../src/validation.js";

const args = process.argv.slice(2);
const reportIndex = args.indexOf("--report");
const reportPath = reportIndex >= 0 ? resolve(args[reportIndex + 1]) : null;
const positional = args.filter((arg, index) => !arg.startsWith("--") && index !== reportIndex + 1);
if (!positional[0]) throw new Error("Usage: npm run map:validate -- <card.json|map.tmj> [--report report.json]");
const inputPath = resolve(positional[0]);
const input = JSON.parse(await readFile(inputPath, "utf8"));
const config = extname(inputPath) === ".tmj" || input.type === "map" ? importTiled(input) : input;
const report = validateMapConfig(config);
const json = `${JSON.stringify(report, null, 2)}\n`;
if (reportPath) await writeFile(reportPath, json);
process.stdout.write(json);
if (!report.passed) process.exitCode = 1;
