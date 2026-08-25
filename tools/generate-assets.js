#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, normalize, relative, resolve } from "node:path";
import { cardAssets, generationJobs, validateManifest } from "../src/asset-manifest.js";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const positional = args.filter((arg) => !arg.startsWith("--"));
const manifestPath = resolve(positional[0] || "assets/manifest.json");
const manifest = validateManifest(JSON.parse(await readFile(manifestPath, "utf8")));
const manifestDir = dirname(manifestPath);
const outputDir = resolve(manifestDir, manifest.output_dir || "generated");
const relativeOutput = relative(manifestDir, outputDir);
if (isAbsolute(relativeOutput) || relativeOutput.startsWith("..")) {
  throw new Error("output_dir must stay inside the manifest directory");
}

const baseUrl = (process.env.AI_BASE_URL || "https://api.openai.com").replace(/\/$/, "");
const endpoint = process.env.AI_IMAGE_PATH || "/v1/images/generations";
const model = process.env.AI_IMAGE_MODEL || "gpt-image-1";
const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
const jobs = generationJobs(manifest);

if (!dryRun && !apiKey) throw new Error("Set AI_API_KEY (or OPENAI_API_KEY) before generating assets");
await mkdir(outputDir, { recursive: true });

for (const job of jobs) {
  const request = {
    model,
    prompt: job.prompt,
    size: job.size,
    response_format: "b64_json",
    ...(job.quality ? { quality: job.quality } : {}),
  };
  if (dryRun) {
    console.log(JSON.stringify({ output: job.output, endpoint: `${baseUrl}${endpoint}`, request }, null, 2));
    continue;
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error(`Image API ${response.status}: ${await response.text()}`);
  const payload = await response.json();
  const result = payload.data?.[0];
  if (!result) throw new Error(`Image API returned no data for ${job.output}`);

  let bytes;
  if (result.b64_json) {
    bytes = Buffer.from(result.b64_json, "base64");
  } else if (result.url) {
    const download = await fetch(result.url);
    if (!download.ok) throw new Error(`Unable to download generated image: ${download.status}`);
    bytes = Buffer.from(await download.arrayBuffer());
  } else {
    throw new Error("Image API result needs b64_json or url");
  }
  await writeFile(join(outputDir, normalize(job.output)), bytes);
  console.log(`Generated ${job.output}`);
}

const configPath = join(outputDir, "assets.card.json");
await writeFile(configPath, `${JSON.stringify(cardAssets(manifest, manifest.card_asset_base || "/local/rpg"), null, 2)}\n`);
console.log(`${dryRun ? "Planned" : "Wrote"} ${jobs.length} assets; card config: ${configPath}`);
