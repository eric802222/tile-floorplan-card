#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { generationJobs, validateManifest } from "../src/asset-manifest.js";
import { createContactSheet } from "../src/postprocess.js";

const manifestPath = resolve(process.argv[2] || "assets/manifest.json");
const manifest = validateManifest(JSON.parse(await readFile(manifestPath, "utf8")));
const outputDir = resolve(dirname(manifestPath), manifest.output_dir || "generated");
const items = await Promise.all(generationJobs(manifest).map(async (job) => ({
  label: `${job.asset.id} · ${job.state}`,
  input: await readFile(join(outputDir, job.output)),
})));
const output = resolve(outputDir, "contact-sheet.png");
await writeFile(output, await createContactSheet(items, { columns: manifest.preview_columns || 4 }));
console.log(`Wrote ${output}`);
