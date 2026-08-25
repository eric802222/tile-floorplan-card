import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { cardAssets, generationJobs, validateManifest } from "./asset-manifest.js";
import { createContactSheet, processAsset } from "./postprocess.js";
import { validateAssetFiles } from "./validation.js";

const exists = async (path) => { try { await access(path); return true; } catch { return false; } };

export async function loadAssetProject(manifestPath) {
  const path = resolve(manifestPath);
  const manifest = validateManifest(JSON.parse(await readFile(path, "utf8")));
  const root = dirname(path);
  const rawDir = resolve(root, manifest.raw_dir || manifest.output_dir || "generated");
  const outputDir = resolve(root, manifest.output_dir || "generated");
  for (const directory of [rawDir, outputDir]) {
    const candidate = relative(root, directory);
    if (isAbsolute(candidate) || candidate.startsWith("..")) throw new Error("raw_dir and output_dir must stay inside the manifest directory");
  }
  return { path, root, manifest, rawDir, outputDir, jobs: generationJobs(manifest) };
}

export function assetGenerationPlan(project, options = {}) {
  const baseUrl = (options.baseUrl || process.env.AI_BASE_URL || "https://api.openai.com").replace(/\/$/, "");
  const endpoint = options.endpoint || process.env.AI_IMAGE_PATH || "/v1/images/generations";
  const model = options.model || process.env.AI_IMAGE_MODEL || "gpt-image-1";
  return {
    kind: "asset-generation-plan",
    passed: true,
    manifest: project.path,
    endpoint: `${baseUrl}${endpoint}`,
    model,
    jobs: project.jobs.map((job) => ({
      asset_id: job.asset.id, state: job.state, output: job.output,
      request: { model, prompt: job.prompt, size: job.size, response_format: "b64_json", ...(job.quality ? { quality: job.quality } : {}) },
    })),
  };
}

export async function generateAssets(project, options = {}) {
  const plan = assetGenerationPlan(project, options);
  if (!options.write) return { ...plan, written: false };
  const apiKey = options.apiKey || process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Set AI_API_KEY (or OPENAI_API_KEY) before generation");
  await Promise.all([mkdir(project.rawDir, { recursive: true }), mkdir(project.outputDir, { recursive: true })]);
  const results = [];
  for (const job of plan.jobs) {
    const outputPath = join(project.rawDir, job.output);
    if (!options.overwrite && await exists(outputPath)) {
      results.push({ asset_id: job.asset_id, state: job.state, output: outputPath, status: "skipped_existing" });
      continue;
    }
    const response = await fetch(plan.endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(job.request),
    });
    if (!response.ok) throw new Error(`Image API ${response.status}: ${await response.text()}`);
    const payload = await response.json();
    const generated = payload.data?.[0];
    if (!generated) throw new Error(`Image API returned no data for ${job.output}`);
    let bytes;
    if (generated.b64_json) bytes = Buffer.from(generated.b64_json, "base64");
    else if (generated.url) {
      const download = await fetch(generated.url);
      if (!download.ok) throw new Error(`Unable to download generated image: ${download.status}`);
      bytes = Buffer.from(await download.arrayBuffer());
    } else throw new Error("Image API result needs b64_json or url");
    await writeFile(outputPath, bytes, { flag: options.overwrite ? "w" : "wx" });
    results.push({ asset_id: job.asset_id, state: job.state, output: outputPath, status: "generated", bytes: bytes.length });
  }
  const cardConfig = join(project.outputDir, "assets.card.json");
  await writeFile(cardConfig, `${JSON.stringify(cardAssets(project.manifest, project.manifest.card_asset_base || "/local/rpg"), null, 2)}\n`);
  return { kind: "asset-generation", passed: true, written: true, manifest: project.path, endpoint: plan.endpoint, model: plan.model, results, card_config: cardConfig };
}

export async function processAssets(project) {
  await mkdir(project.outputDir, { recursive: true });
  const results = [];
  for (const job of project.jobs) {
    const inputPath = join(project.rawDir, job.output);
    const outputPath = join(project.outputDir, job.output);
    const output = await processAsset(await readFile(inputPath), {
      width: job.asset.width, height: job.asset.height, tileSize: project.manifest.tile_size || 16,
      chromaColor: job.asset.chroma_color || project.manifest.chroma_color || "#FF00FF",
      chromaTolerance: job.asset.chroma_tolerance ?? project.manifest.chroma_tolerance,
      alphaThreshold: job.asset.alpha_threshold ?? project.manifest.alpha_threshold,
      maxColors: job.asset.max_colors || project.manifest.max_colors || 64,
      anchor: job.asset.anchor || project.manifest.anchor || "bottom",
    });
    await writeFile(outputPath, output);
    results.push({ asset_id: job.asset.id, state: job.state, output: outputPath, bytes: output.length });
  }
  return { kind: "asset-processing", passed: true, manifest: project.path, results };
}

export async function previewAssets(project) {
  const items = await Promise.all(project.jobs.map(async (job) => ({ label: `${job.asset.id} · ${job.state}`, input: await readFile(join(project.outputDir, job.output)) })));
  const output = join(project.outputDir, "contact-sheet.png");
  await writeFile(output, await createContactSheet(items, { columns: project.manifest.preview_columns || 4 }));
  return { kind: "asset-preview", passed: true, manifest: project.path, output, assets: items.length };
}

export async function inspectAssets(project) {
  return {
    kind: "asset-inspection", passed: true, manifest: project.path, tile_size: Number(project.manifest.tile_size || 16),
    raw_dir: project.rawDir, output_dir: project.outputDir, assets: project.manifest.assets.length,
    states: project.jobs.length, jobs: project.jobs.map((job) => ({ asset_id: job.asset.id, state: job.state, output: job.output, width: job.asset.width, height: job.asset.height })),
  };
}

export async function validateAssets(project, options = {}) {
  return validateAssetFiles(project.manifest, project.outputDir, { strict: Boolean(options.strict) });
}
