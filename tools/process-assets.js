#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { generationJobs, validateManifest } from "../src/asset-manifest.js";
import { processAsset } from "../src/postprocess.js";

const manifestPath = resolve(process.argv[2] || "assets/manifest.json");
const manifest = validateManifest(JSON.parse(await readFile(manifestPath, "utf8")));
const root = dirname(manifestPath);
const rawDir = resolve(root, manifest.raw_dir || manifest.output_dir || "generated");
const outputDir = resolve(root, manifest.output_dir || "generated");
if ([rawDir, outputDir].some((path) => {
  const candidate = relative(root, path);
  return isAbsolute(candidate) || candidate.startsWith("..");
})) throw new Error("raw_dir and output_dir must stay inside the manifest directory");
await mkdir(outputDir, { recursive: true });

for (const job of generationJobs(manifest)) {
  const input = await readFile(join(rawDir, job.output));
  const output = await processAsset(input, {
    width: job.asset.width,
    height: job.asset.height,
    tileSize: manifest.tile_size || 16,
    chromaColor: job.asset.chroma_color || manifest.chroma_color || "#FF00FF",
    chromaTolerance: job.asset.chroma_tolerance ?? manifest.chroma_tolerance,
    alphaThreshold: job.asset.alpha_threshold ?? manifest.alpha_threshold,
    maxColors: job.asset.max_colors || manifest.max_colors || 64,
    anchor: job.asset.anchor || manifest.anchor || "bottom",
  });
  await writeFile(join(outputDir, job.output), output);
  console.log(`Processed ${job.output}`);
}
