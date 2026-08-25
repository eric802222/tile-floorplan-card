export const DEFAULT_CONFIG = Object.freeze({
  type: "custom:ha-floorplan-card",
  grid: { width: 20, height: 15, tile_size: 16, background: "" },
  show_grid: false,
  assets: [],
  objects: [],
});

const numberOr = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function normalizeConfig(input = {}) {
  const grid = input.grid || {};
  return {
    ...input,
    type: "custom:ha-floorplan-card",
    grid: {
      ...grid,
      width: Math.max(1, numberOr(grid.width, DEFAULT_CONFIG.grid.width)),
      height: Math.max(1, numberOr(grid.height, DEFAULT_CONFIG.grid.height)),
      tile_size: Math.max(1, numberOr(grid.tile_size, DEFAULT_CONFIG.grid.tile_size)),
      background: grid.background || "",
    },
    show_grid: Boolean(input.show_grid),
    assets: Array.isArray(input.assets)
      ? input.assets.map((asset, index) => normalizeAsset(asset, index))
      : [],
    objects: Array.isArray(input.objects)
      ? input.objects.map((object, index) => normalizeObject(object, index))
      : [],
  };
}

export function normalizeAsset(input = {}, index = 0) {
  return {
    ...input,
    id: input.id || `asset-${index + 1}`,
    name: input.name || input.id || `Asset ${index + 1}`,
    width: Math.max(0.25, numberOr(input.width, 1)),
    height: Math.max(0.25, numberOr(input.height, 1)),
    images: { ...(input.images || {}) },
  };
}

export function resolveObject(object, assets = []) {
  const asset = assets.find((candidate) => candidate.id === object.asset_id);
  if (!asset) return object;
  return {
    ...asset,
    ...object,
    images: { ...asset.images, ...object.images },
    width: object.width ?? asset.width,
    height: object.height ?? asset.height,
  };
}

export function normalizeObject(input = {}, index = 0) {
  return {
    ...input,
    id: input.id || `object-${index + 1}`,
    type: input.type || (input.entity_id ? "entity" : "virtual"),
    x: numberOr(input.x, 0),
    y: numberOr(input.y, 0),
    z: numberOr(input.z, 0),
    width: input.width === undefined && input.asset_id ? undefined : Math.max(0.25, numberOr(input.width, 1)),
    height: input.height === undefined && input.asset_id ? undefined : Math.max(0.25, numberOr(input.height, 1)),
    images: { ...(input.images || {}) },
  };
}

export function imageForObject(object, hass) {
  let image = object.images?.default || "";
  if (object.entity_id) {
    const state = hass?.states?.[object.entity_id]?.state;
    if (state && object.images?.[state]) image = object.images[state];
  }
  for (const condition of object.conditions || []) {
    const state = hass?.states?.[condition?.if?.entity_id]?.state;
    if (state === condition?.if?.state) image = condition.image || image;
  }
  return image;
}

export function actionForObject(object, gesture = "tap") {
  const configured = object[`${gesture}_action`];
  if (configured) return configured;
  if (gesture === "tap" && object.entity_id) {
    return { action: "toggle" };
  }
  return { action: "none" };
}

export function clampObject(object, grid) {
  return {
    ...object,
    x: Math.max(0, Math.min(object.x, grid.width - object.width)),
    y: Math.max(0, Math.min(object.y, grid.height - object.height)),
  };
}
