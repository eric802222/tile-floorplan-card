import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { resolveObject } from "./config.js";
import { generationJobs, validateManifest } from "./asset-manifest.js";

const issue = (code, message, context = {}) => ({ code, message, ...context });

export async function validateAssetFiles(manifestInput, outputDir, options = {}) {
  const manifest = validateManifest(manifestInput);
  const errors = [];
  const warnings = [];
  const files = [];
  const hashes = new Map();
  const maxColors = Number(manifest.max_colors || 64);

  for (const job of generationJobs(manifest)) {
    const path = join(outputDir, job.output);
    const record = { asset_id: job.asset.id, state: job.state, file: job.output };
    let bytes;
    try {
      bytes = await readFile(path);
    } catch {
      errors.push(issue("missing_file", `Missing generated file ${job.output}`, record));
      files.push({ ...record, valid: false });
      continue;
    }

    try {
      const image = sharp(bytes, { failOn: "error" });
      const metadata = await image.metadata();
      if (metadata.format !== "png") errors.push(issue("not_png", `${job.output} is ${metadata.format || "unknown"}, expected PNG`, record));
      const expectedWidth = Number(job.asset.width) * Number(manifest.tile_size || 16);
      const expectedHeight = Number(job.asset.height) * Number(manifest.tile_size || 16);
      const dimensionIssue = metadata.width !== expectedWidth || metadata.height !== expectedHeight;
      if (dimensionIssue) {
        (options.strict ? errors : warnings).push(issue(
          "unexpected_dimensions",
          `${job.output} is ${metadata.width}×${metadata.height}; production size is ${expectedWidth}×${expectedHeight}`,
          { ...record, actual: [metadata.width, metadata.height], expected: [expectedWidth, expectedHeight] },
        ));
      }

      const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const colors = new Set();
      let visible = 0;
      let partialAlpha = 0;
      let chromaPixels = 0;
      for (let offset = 0; offset < data.length; offset += info.channels) {
        const [r, g, b, a] = [data[offset], data[offset + 1], data[offset + 2], data[offset + 3]];
        if (a > 0) {
          visible++;
          colors.add(`${r},${g},${b},${a}`);
          if (a < 255) partialAlpha++;
          if (r > 240 && g < 24 && b > 240) chromaPixels++;
        }
      }
      if (!metadata.hasAlpha) (options.strict ? errors : warnings).push(issue("no_alpha", `${job.output} has no alpha channel`, record));
      if (visible === 0) errors.push(issue("empty_image", `${job.output} is fully transparent`, record));
      if (partialAlpha > 0) (options.strict ? errors : warnings).push(issue("partial_alpha", `${job.output} has ${partialAlpha} anti-aliased alpha pixels`, { ...record, count: partialAlpha }));
      if (chromaPixels > 0) (options.strict ? errors : warnings).push(issue("chroma_remaining", `${job.output} still contains ${chromaPixels} magenta chroma-key pixels`, { ...record, count: chromaPixels }));
      if (colors.size > maxColors) (options.strict ? errors : warnings).push(issue("palette_too_large", `${job.output} uses ${colors.size} visible RGBA colors; limit is ${maxColors}`, { ...record, colors: colors.size, limit: maxColors }));

      const hash = createHash("sha256").update(bytes).digest("hex");
      if (hashes.has(hash)) errors.push(issue("duplicate_image", `${job.output} is identical to ${hashes.get(hash)}`, record));
      else hashes.set(hash, job.output);
      files.push({ ...record, valid: true, width: metadata.width, height: metadata.height, has_alpha: Boolean(metadata.hasAlpha), colors: colors.size, sha256: hash });
    } catch (error) {
      errors.push(issue("invalid_image", `${job.output} cannot be decoded: ${error.message}`, record));
      files.push({ ...record, valid: false });
    }
  }

  return { kind: "asset-validation", strict: Boolean(options.strict), passed: errors.length === 0, errors, warnings, files };
}

const ENTITY_ID = /^[a-z0-9_]+\.[a-z0-9_]+$/;
const ACTIONS = new Set(["none", "toggle", "more-info", "call-service", "navigate", "url"]);

export function validateMapConfig(config) {
  const errors = [];
  const warnings = [];
  const assets = Array.isArray(config.assets) ? config.assets : [];
  const objects = Array.isArray(config.objects) ? config.objects : [];
  const assetIds = new Set();
  const objectIds = new Set();

  if (!(Number(config.grid?.width) > 0) || !(Number(config.grid?.height) > 0)) {
    errors.push(issue("invalid_grid", "Map grid needs positive width and height"));
  }

  for (const asset of assets) {
    if (assetIds.has(asset.id)) errors.push(issue("duplicate_asset_id", `Duplicate asset id ${asset.id}`, { asset_id: asset.id }));
    assetIds.add(asset.id);
    if (!asset.images?.default) warnings.push(issue("asset_without_default_image", `Asset ${asset.id} has no default image`, { asset_id: asset.id }));
  }

  for (const object of objects) {
    if (objectIds.has(object.id)) errors.push(issue("duplicate_object_id", `Duplicate object id ${object.id}`, { object_id: object.id }));
    objectIds.add(object.id);
    if (object.asset_id && !assetIds.has(object.asset_id)) errors.push(issue("unknown_asset", `Object ${object.id} references missing asset ${object.asset_id}`, { object_id: object.id, asset_id: object.asset_id }));
    if (object.entity_id && !ENTITY_ID.test(object.entity_id)) errors.push(issue("invalid_entity_id", `Object ${object.id} has invalid entity id ${object.entity_id}`, { object_id: object.id }));
    const resolved = resolveObject(object, assets);
    if ([resolved.x, resolved.y, resolved.width, resolved.height].some(value => !Number.isFinite(Number(value)))) {
      errors.push(issue("invalid_geometry", `Object ${object.id} has non-numeric geometry`, { object_id: object.id }));
    } else if (Number(resolved.x) < 0 || Number(resolved.y) < 0 || Number(resolved.x) + Number(resolved.width) > Number(config.grid?.width) || Number(resolved.y) + Number(resolved.height) > Number(config.grid?.height)) {
      errors.push(issue("out_of_bounds", `Object ${object.id} extends outside the map`, { object_id: object.id }));
    }
    const action = object.tap_action?.action || (object.entity_id ? "toggle" : "none");
    if (!ACTIONS.has(action)) errors.push(issue("invalid_action", `Object ${object.id} uses unsupported action ${action}`, { object_id: object.id }));
    if (action === "call-service" && !object.tap_action?.service?.includes(".")) errors.push(issue("missing_service", `Object ${object.id} call-service action needs domain.service`, { object_id: object.id }));
  }

  return { kind: "map-validation", passed: errors.length === 0, errors, warnings, summary: { assets: assets.length, objects: objects.length } };
}
