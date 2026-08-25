#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { assetGenerationPlan, generateAssets, inspectAssets, loadAssetProject, previewAssets, processAssets, validateAssets } from "../src/asset-pipeline.js";
import { editMapObject } from "../src/map-editor.js";
import { loadMapConfig, summarizeMap } from "../src/map-io.js";
import { renderMap } from "../src/map-renderer.js";
import { reviewMap } from "../src/map-review.js";
import { validateMapConfig } from "../src/validation.js";

const argv = process.argv.slice(2);
const command = argv[0];
const subcommand = argv[1];
const value = (flag, fallback) => { const index = argv.indexOf(flag); return index >= 0 ? argv[index + 1] : fallback; };
const has = (flag) => argv.includes(flag);
const required = (flag) => { const result = value(flag); if (result == null) throw new Error(`Missing required option ${flag}`); return result; };
const output = (result) => {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result?.passed === false) process.exitCode = 1;
};

const help = {
  kind: "tile-floorplan-help",
  commands: {
    inspect: "inspect --map <card.json|map.tmj>",
    validate: "validate --map <card.json|map.tmj>",
    render: "render --map <file> --www-root <dir> [--states <json>] --output <png>",
    review: "review --map <file> --www-root <dir> --scenarios <json> [--baseline-dir <dir>]",
    object_add: "object add --map <card.json> --object-json <json> [--write]",
    object_move: "object move --map <card.json> --id <id> --x <n> --y <n> [--write]",
    object_resize: "object resize --map <card.json> --id <id> --width <n> --height <n> [--write]",
    object_remove: "object remove --map <card.json> --id <id> [--write]",
    asset_inspect: "asset inspect --manifest <manifest.json>",
    asset_plan: "asset plan --manifest <manifest.json>",
    asset_generate: "asset generate --manifest <manifest.json> [--write] [--overwrite]",
    asset_process: "asset process --manifest <manifest.json>",
    asset_preview: "asset preview --manifest <manifest.json>",
    asset_validate: "asset validate --manifest <manifest.json> [--strict]",
  },
  note: "Object commands are dry-run unless --write is present; successful writes create <map>.bak.",
};

try {
  if (!command || has("--help") || command === "help") {
    output(help);
  } else if (command === "inspect" || command === "validate") {
    const { inputPath, config } = await loadMapConfig(required("--map"));
    const validation = validateMapConfig(config);
    output(command === "validate" ? validation : { kind: "map-inspection", passed: validation.passed, map: inputPath, summary: summarizeMap(config), validation });
  } else if (command === "render") {
    const { config } = await loadMapConfig(required("--map"));
    const validation = validateMapConfig(config);
    if (!validation.passed) output(validation);
    else {
      const statesPath = value("--states");
      const states = statesPath ? JSON.parse(await readFile(resolve(statesPath), "utf8")) : {};
      const outputPath = resolve(value("--output", "map-preview.png"));
      const result = await renderMap(config, { wwwRoot: resolve(required("--www-root")), states, scale: Number(value("--scale", "4")), showGrid: has("--show-grid") });
      await writeFile(outputPath, result.buffer);
      output({ ...result.report, output: outputPath });
    }
  } else if (command === "review") {
    const baselineDir = value("--baseline-dir");
    const outputDir = resolve(value("--output-dir", "map-review"));
    const result = await reviewMap({
      mapPath: required("--map"), wwwRoot: required("--www-root"), scenarioPath: required("--scenarios"), outputDir,
      baselineDir: baselineDir ? resolve(baselineDir) : undefined, diffDir: resolve(value("--diff-dir", `${outputDir}/diffs`)),
      scale: Number(value("--scale", "4")), threshold: Number(value("--threshold", "0")),
      maxRatio: Number(value("--max-ratio", "0")), showGrid: has("--show-grid"),
    });
    output({ ...result.report, overview: result.overviewPath });
  } else if (command === "object") {
    const common = { write: has("--write") };
    let options = common;
    if (subcommand === "add") options = { ...common, object: JSON.parse(required("--object-json")) };
    else if (subcommand === "move") options = { ...common, id: required("--id"), x: required("--x"), y: required("--y") };
    else if (subcommand === "resize") options = { ...common, id: required("--id"), width: required("--width"), height: required("--height") };
    else if (subcommand === "remove") options = { ...common, id: required("--id") };
    else throw new Error(`Unknown object subcommand: ${subcommand || "(missing)"}`);
    output(await editMapObject(required("--map"), subcommand, options));
  } else if (command === "asset") {
    const project = await loadAssetProject(required("--manifest"));
    if (subcommand === "inspect") output(await inspectAssets(project));
    else if (subcommand === "plan") output(assetGenerationPlan(project));
    else if (subcommand === "generate") output(await generateAssets(project, { write: has("--write"), overwrite: has("--overwrite") }));
    else if (subcommand === "process") output(await processAssets(project));
    else if (subcommand === "preview") output(await previewAssets(project));
    else if (subcommand === "validate") output(await validateAssets(project, { strict: has("--strict") }));
    else throw new Error(`Unknown asset subcommand: ${subcommand || "(missing)"}`);
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
} catch (error) {
  output({ kind: "tile-floorplan-error", passed: false, error: error instanceof Error ? error.message : String(error) });
}
