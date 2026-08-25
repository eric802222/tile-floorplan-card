import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const exec = promisify(execFile);
const cli = resolve("bin/tile-floorplan.js");

describe("unified CLI", () => {
  it("inspects a map with stable JSON output", async () => {
    const result = await exec("node", [cli, "inspect", "--map", "test/fixtures/visual-regression/card.json"]);
    expect(JSON.parse(result.stdout)).toMatchObject({ kind: "map-inspection", passed: true, summary: { objects: 1, entities: ["light.room"] } });
  });

  it("previews then writes an object move", async () => {
    const root = await mkdtemp(join(tmpdir(), "floorplan-cli-"));
    const path = join(root, "map.json");
    await writeFile(path, JSON.stringify({ grid: { width: 4, height: 4 }, objects: [{ id: "chair", x: 0, y: 0, width: 1, height: 1, images: { default: "chair.png" } }] }));
    const preview = JSON.parse((await exec("node", [cli, "object", "move", "--map", path, "--id", "chair", "--x", "2", "--y", "1"])).stdout);
    expect(preview).toMatchObject({ passed: true, written: false, after: { x: 2, y: 1 } });
    const written = JSON.parse((await exec("node", [cli, "object", "move", "--map", path, "--id", "chair", "--x", "2", "--y", "1", "--write"])).stdout);
    expect(written).toMatchObject({ passed: true, written: true });
    expect(JSON.parse(await readFile(path, "utf8")).objects[0]).toMatchObject({ x: 2, y: 1 });
  });

  it("plans asset generation without provider credentials", async () => {
    const result = await exec("node", [cli, "asset", "plan", "--manifest", "assets/manifest.example.json"], {
      env: { PATH: process.env.PATH },
    });
    const report = JSON.parse(result.stdout);
    expect(report).toMatchObject({ kind: "asset-generation-plan", passed: true });
    expect(report.jobs[0]).toMatchObject({ request: { response_format: "b64_json" } });
  });
});
