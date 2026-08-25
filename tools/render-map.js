#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { renderMap } from "../src/map-renderer.js";
import { importTiled } from "../src/tiled.js";
import { validateMapConfig } from "../src/validation.js";

const args = process.argv.slice(2);
const valueAfter = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : fallback;
};
const positional = args.filter((arg, index) => !arg.startsWith("--") && !["--output", "--report", "--states", "--www-root", "--scale"].some((flag) => args[index - 1] === flag));
if (!positional[0]) throw new Error("Usage: npm run map:render -- <card.json|map.tmj> --www-root <config/www> [--states states.json] [--output map.png]");
const inputPath = resolve(positional[0]);
const source = JSON.parse(await readFile(inputPath, "utf8"));
const config = extname(inputPath) === ".tmj" || source.type === "map" ? importTiled(source) : source;
const validation = validateMapConfig(config);
if (!validation.passed) {
  process.stderr.write(`${JSON.stringify(validation, null, 2)}\n`);
  throw new Error("Map validation failed; render aborted");
}
const statesPath = valueAfter("--states");
const states = statesPath ? JSON.parse(await readFile(resolve(statesPath), "utf8")) : {};
const outputPath = resolve(valueAfter("--output", "map-preview.png"));
const reportPath = resolve(valueAfter("--report", `${outputPath}.json`));
const result = await renderMap(config, {
  wwwRoot: resolve(valueAfter("--www-root", ".")),
  states,
  scale: Number(valueAfter("--scale", "4")),
  showGrid: args.includes("--show-grid"),
});
await writeFile(outputPath, result.buffer);
await writeFile(reportPath, `${JSON.stringify(result.report, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${reportPath}`);
if (!result.report.passed) process.exitCode = 1;
