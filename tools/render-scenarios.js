#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { renderMap } from "../src/map-renderer.js";
import { createContactSheet } from "../src/postprocess.js";
import { importTiled } from "../src/tiled.js";
import { validateMapConfig } from "../src/validation.js";
import { validateScenarios } from "../src/visual-regression.js";

const args = process.argv.slice(2);
const valueAfter = (flag, fallback) => { const index = args.indexOf(flag); return index >= 0 ? args[index + 1] : fallback; };
const flagsWithValues = ["--scenarios", "--output-dir", "--www-root", "--scale", "--columns"];
const positional = args.filter((arg, index) => !arg.startsWith("--") && !flagsWithValues.includes(args[index - 1]));
if (!positional[0]) throw new Error("Usage: npm run map:scenarios -- <card.json|map.tmj> --scenarios <scenarios.json> --www-root <config/www>");
const inputPath = resolve(positional[0]);
const scenarioPath = resolve(valueAfter("--scenarios", "assets/scenarios.json"));
const outputDir = resolve(valueAfter("--output-dir", "map-scenarios"));
const source = JSON.parse(await readFile(inputPath, "utf8"));
const config = extname(inputPath) === ".tmj" || source.type === "map" ? importTiled(source) : source;
const validation = validateMapConfig(config);
if (!validation.passed) throw new Error(`Map validation failed: ${JSON.stringify(validation.errors)}`);
const scenarios = validateScenarios(JSON.parse(await readFile(scenarioPath, "utf8")));
await mkdir(outputDir, { recursive: true });
const items = [];
const reports = [];
for (const scenario of scenarios) {
  const result = await renderMap(config, {
    wwwRoot: resolve(valueAfter("--www-root", ".")), states: scenario.states,
    scale: Number(valueAfter("--scale", "4")), showGrid: args.includes("--show-grid"),
  });
  const imageName = `${scenario.id}.png`;
  await writeFile(join(outputDir, imageName), result.buffer);
  await writeFile(join(outputDir, `${scenario.id}.report.json`), `${JSON.stringify(result.report, null, 2)}\n`);
  items.push({ label: scenario.name, input: result.buffer });
  reports.push({ id: scenario.id, name: scenario.name, image: imageName, passed: result.report.passed });
}
await writeFile(join(outputDir, "overview.png"), await createContactSheet(items, { columns: Number(valueAfter("--columns", "2")), cellWidth: 360, cellHeight: 300 }));
await writeFile(join(outputDir, "scenarios.report.json"), `${JSON.stringify({ kind: "scenario-render", map: basename(inputPath), passed: reports.every((item) => item.passed), scenarios: reports }, null, 2)}\n`);
console.log(`Rendered ${reports.length} scenarios to ${outputDir}`);
if (!reports.every((item) => item.passed)) process.exitCode = 1;
