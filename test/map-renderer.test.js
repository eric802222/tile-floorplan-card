import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { renderMap, resolveLocalAsset } from "../src/map-renderer.js";

const png = (color) => sharp({
  create: { width: 16, height: 16, channels: 4, background: color },
}).png().toBuffer();

describe("offline map renderer", () => {
  it("renders the selected Home Assistant state on the logical grid", async () => {
    const root = await mkdtemp(join(tmpdir(), "floorplan-www-"));
    await mkdir(join(root, "rpg"));
    await writeFile(join(root, "rpg/lamp-off.png"), await png({ r: 30, g: 30, b: 30, alpha: 1 }));
    await writeFile(join(root, "rpg/lamp-on.png"), await png({ r: 255, g: 220, b: 40, alpha: 1 }));
    const config = {
      grid: { width: 4, height: 3, tile_size: 16 },
      assets: [{ id: "lamp", width: 1, height: 1, images: { default: "/local/rpg/lamp-off.png", on: "/local/rpg/lamp-on.png" } }],
      objects: [{ id: "lamp-1", asset_id: "lamp", entity_id: "light.room", x: 2, y: 1, z: 1 }],
    };
    const { buffer, report } = await renderMap(config, { wwwRoot: root, states: { "light.room": "on" }, scale: 2 });
    const metadata = await sharp(buffer).metadata();
    const pixel = await sharp(buffer).extract({ left: 64, top: 32, width: 1, height: 1 }).removeAlpha().raw().toBuffer();
    expect(metadata).toMatchObject({ width: 128, height: 96 });
    expect([...pixel]).toEqual([255, 220, 40]);
    expect(report).toMatchObject({ passed: true, placed: [{ object_id: "lamp-1", state: "on" }] });
  });

  it("rejects paths escaping the Home Assistant www root", () => {
    expect(() => resolveLocalAsset("../../secret.png", "/tmp/www")).toThrow(/escapes www root/);
  });

  it("reports remote images as non-renderable", async () => {
    const result = await renderMap({
      grid: { width: 2, height: 2, tile_size: 16 },
      objects: [{ id: "remote", x: 0, y: 0, width: 1, height: 1, images: { default: "https://example.com/a.png" } }],
    });
    expect(result.report.passed).toBe(false);
    expect(result.report.errors[0].code).toBe("remote_image");
  });
});
