const SAFE_ID = /^[a-z0-9][a-z0-9-_]*$/;
const SAFE_STATE = /^[a-z0-9][a-z0-9-_]*$/;

export function validateManifest(input) {
  if (!input || typeof input !== "object") throw new Error("Asset manifest must be a JSON object");
  if (input.schema_version !== 1) throw new Error("Only asset manifest schema_version 1 is supported");
  if (!Array.isArray(input.assets) || input.assets.length === 0) throw new Error("Asset manifest needs at least one asset");

  const ids = new Set();
  for (const asset of input.assets) {
    if (!SAFE_ID.test(asset.id || "")) throw new Error(`Invalid asset id: ${asset.id || "<empty>"}`);
    if (ids.has(asset.id)) throw new Error(`Duplicate asset id: ${asset.id}`);
    ids.add(asset.id);
    if (!(Number(asset.width) > 0) || !(Number(asset.height) > 0)) throw new Error(`Asset ${asset.id} needs positive width and height`);
    if (!asset.prompt && !input.style_prompt) throw new Error(`Asset ${asset.id} needs a prompt`);
    const states = asset.states || { default: {} };
    if (!Object.keys(states).includes("default")) throw new Error(`Asset ${asset.id} needs a default state`);
    for (const state of Object.keys(states)) {
      if (!SAFE_STATE.test(state)) throw new Error(`Invalid state ${state} in asset ${asset.id}`);
    }
  }
  return input;
}

export function generationJobs(input) {
  const manifest = validateManifest(input);
  return manifest.assets.flatMap((asset) => Object.entries(asset.states || { default: {} }).map(([state, stateConfig]) => ({
    asset,
    state,
    output: `${asset.id}-${state}.png`,
    prompt: [
      manifest.style_prompt,
      asset.prompt,
      stateConfig.prompt,
      `Game asset occupying ${asset.width} by ${asset.height} logical tiles, ${manifest.tile_size || 16} pixels per tile.`,
      "Single isolated object, orthographic top-down RPG perspective, centered, no text, no border.",
      manifest.background_prompt || "Solid chroma-key background with no shadow outside the object.",
    ].filter(Boolean).join("\n"),
    size: stateConfig.size || asset.size || manifest.image_size || "1024x1024",
    quality: stateConfig.quality || asset.quality || manifest.quality,
  })));
}

export function cardAssets(manifest, outputBase = "/local/rpg") {
  validateManifest(manifest);
  const base = outputBase.replace(/\/$/, "");
  return manifest.assets.map((asset) => ({
    id: asset.id,
    name: asset.name || asset.id,
    width: Number(asset.width),
    height: Number(asset.height),
    images: Object.fromEntries(
      Object.keys(asset.states || { default: {} }).map((state) => [state, `${base}/${asset.id}-${state}.png`]),
    ),
    ...(asset.tags ? { tags: asset.tags } : {}),
  }));
}
