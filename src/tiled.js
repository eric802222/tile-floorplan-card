import { normalizeConfig } from "./config.js";

const propertyMap = (properties = []) => Object.fromEntries(
  properties.map(({ name, value }) => [name, value]),
);

const propertyList = (values) => Object.entries(values)
  .filter(([, value]) => value !== undefined && value !== null && value !== "")
  .map(([name, value]) => ({
    name,
    type: typeof value === "number" ? "float" : typeof value === "boolean" ? "bool" : "string",
    value: typeof value === "object" ? JSON.stringify(value) : value,
  }));

const parseJson = (value, fallback) => {
  if (typeof value !== "string") return value ?? fallback;
  try { return JSON.parse(value); } catch { return fallback; }
};

export function exportTiled(configInput) {
  const config = normalizeConfig(configInput);
  const { grid } = config;
  return {
    type: "map",
    version: "1.10",
    tiledversion: "1.11.2",
    orientation: "orthogonal",
    renderorder: "right-down",
    width: grid.width,
    height: grid.height,
    tilewidth: grid.tile_size,
    tileheight: grid.tile_size,
    infinite: false,
    nextlayerid: 3,
    nextobjectid: config.objects.length + 1,
    properties: propertyList({
      ha_card_type: config.type,
      background: grid.background,
      assets: config.assets,
    }),
    layers: [
      ...(grid.background ? [{
        id: 1, name: "Background", type: "imagelayer", image: grid.background,
        x: 0, y: 0, visible: true, opacity: 1,
      }] : []),
      {
        id: 2,
        name: "Home Assistant Objects",
        type: "objectgroup",
        draworder: "index",
        visible: true,
        opacity: 1,
        objects: config.objects.map((object, index) => ({
          id: index + 1,
          name: object.id,
          class: object.type === "entity" ? "ha-entity" : "virtual",
          x: object.x * grid.tile_size,
          y: object.y * grid.tile_size,
          width: object.width * grid.tile_size,
          height: object.height * grid.tile_size,
          visible: object.visible !== false,
          properties: propertyList({
            entity_id: object.entity_id,
            asset_id: object.asset_id,
            z: object.z,
            images: object.images,
            conditions: object.conditions,
            tap_action: object.tap_action,
          }),
        })),
      },
    ],
  };
}

export function importTiled(tiled, existing = {}) {
  if (!tiled || tiled.type !== "map") throw new Error("The selected file is not a Tiled JSON map");
  const mapProperties = propertyMap(tiled.properties);
  const tileSize = Number(tiled.tilewidth || tiled.tileheight || existing.grid?.tile_size || 16);
  const backgroundLayer = (tiled.layers || []).find((layer) => layer.type === "imagelayer");
  const objectLayers = (tiled.layers || []).filter((layer) => layer.type === "objectgroup");
  const objects = objectLayers.flatMap((layer) => (layer.objects || []).map((item, index) => {
    const properties = propertyMap(item.properties);
    return {
      id: item.name || `object-${index + 1}`,
      type: item.class === "ha-entity" || properties.entity_id ? "entity" : "virtual",
      entity_id: properties.entity_id || "",
      asset_id: properties.asset_id || "",
      x: Number(item.x || 0) / tileSize,
      y: Number(item.y || 0) / tileSize,
      z: Number(properties.z ?? index),
      width: Number(item.width || tileSize) / tileSize,
      height: Number(item.height || tileSize) / tileSize,
      visible: item.visible !== false,
      images: parseJson(properties.images, {}),
      conditions: parseJson(properties.conditions, undefined),
      tap_action: parseJson(properties.tap_action, undefined),
    };
  }));

  return normalizeConfig({
    ...existing,
    grid: {
      ...existing.grid,
      width: Number(tiled.width || existing.grid?.width || 20),
      height: Number(tiled.height || existing.grid?.height || 15),
      tile_size: tileSize,
      background: mapProperties.background || backgroundLayer?.image || existing.grid?.background || "",
    },
    assets: parseJson(mapProperties.assets, existing.assets || []),
    objects,
  });
}
