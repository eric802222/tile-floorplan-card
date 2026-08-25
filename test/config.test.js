import { describe, expect, it } from "vitest";
import { actionForObject, clampObject, imageForObject, normalizeConfig } from "../src/config.js";

describe("configuration", () => {
  it("normalizes legacy configuration without discarding custom fields", () => {
    const config = normalizeConfig({
      grid: { width: "20", height: "15", tile_size: "16" },
      objects: [{ entity_id: "light.room", conditions: [{ if: { entity_id: "sun.sun", state: "below_horizon" }, image: "night.png" }] }],
    });
    expect(config.grid.width).toBe(20);
    expect(config.objects[0].conditions).toHaveLength(1);
    expect(config.objects[0].type).toBe("entity");
  });

  it("selects entity state and then matching conditional image", () => {
    const object = {
      entity_id: "light.room",
      images: { default: "default.png", on: "on.png" },
      conditions: [{ if: { entity_id: "input_boolean.night", state: "on" }, image: "night.png" }],
    };
    const hass = { states: { "light.room": { state: "on" }, "input_boolean.night": { state: "on" } } };
    expect(imageForObject(object, hass)).toBe("night.png");
  });

  it("keeps objects inside the map", () => {
    expect(clampObject({ x: 20, y: -2, width: 2, height: 2 }, { width: 20, height: 15 }))
      .toMatchObject({ x: 18, y: 0 });
  });

  it("provides legacy toggle behavior", () => {
    expect(actionForObject({ entity_id: "switch.fan" })).toEqual({ action: "toggle" });
  });
});
