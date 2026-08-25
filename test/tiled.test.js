import { describe, expect, it } from "vitest";
import { exportTiled, importTiled } from "../src/tiled.js";

const config = {
  type: "custom:ha-floorplan-card",
  grid: { width: 24, height: 18, tile_size: 16, background: "/local/home.png" },
  assets: [{ id: "lamp", name: "Lamp", width: 1, height: 2, images: { default: "/local/lamp.png" } }],
  objects: [{
    id: "living-lamp", type: "entity", entity_id: "light.living_room", asset_id: "lamp",
    x: 4, y: 6, z: 3, width: 1, height: 2, images: { on: "/local/lamp-on.png" },
    tap_action: { action: "toggle" },
  }],
};

describe("Tiled interchange", () => {
  it("exports a Tiled object layer using pixel coordinates", () => {
    const tiled = exportTiled(config);
    const object = tiled.layers.find(layer => layer.type === "objectgroup").objects[0];
    expect(tiled.tilewidth).toBe(16);
    expect(object.x).toBe(64);
    expect(object.y).toBe(96);
    expect(object.class).toBe("ha-entity");
  });

  it("round-trips assets and Home Assistant behavior", () => {
    const imported = importTiled(exportTiled(config));
    expect(imported.grid).toMatchObject({ width: 24, height: 18, tile_size: 16, background: "/local/home.png" });
    expect(imported.assets[0].id).toBe("lamp");
    expect(imported.objects[0]).toMatchObject({
      entity_id: "light.living_room", asset_id: "lamp", x: 4, y: 6, z: 3,
      tap_action: { action: "toggle" },
    });
  });

  it("rejects unrelated JSON files", () => {
    expect(() => importTiled({ type: "tileset" })).toThrow(/not a Tiled JSON map/);
  });
});
