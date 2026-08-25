import { createServer } from "node:http";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterEach, describe, expect, it } from "vitest";
import { assetGenerationPlan, generateAssets, loadAssetProject, previewAssets, processAssets, validateAssets } from "../src/asset-pipeline.js";

let server;
afterEach(() => server?.close());

const createProject = async () => {
  const root = await mkdtemp(join(tmpdir(), "asset-pipeline-"));
  const manifestPath = join(root, "manifest.json");
  await writeFile(manifestPath, JSON.stringify({
    schema_version: 1, tile_size: 16, raw_dir: "raw", output_dir: "generated", max_colors: 16,
    style_prompt: "Original top-down pixel art.", background_prompt: "Pure #FF00FF background.",
    assets: [{ id: "lamp", width: 1, height: 1, prompt: "Wooden lamp.", states: { default: {}, on: { prompt: "Lit." } } }],
  }));
  return { root, manifestPath, project: await loadAssetProject(manifestPath) };
};

describe("unified asset pipeline", () => {
  it("plans OpenAI-compatible requests without credentials or writes", async () => {
    const { project } = await createProject();
    const plan = assetGenerationPlan(project, { baseUrl: "http://provider.test", model: "image-model" });
    expect(plan).toMatchObject({ passed: true, endpoint: "http://provider.test/v1/images/generations", model: "image-model", jobs: [{ request: { model: "image-model", response_format: "b64_json" } }, {}] });
  });

  it("generates, processes, previews, and strictly validates assets", async () => {
    const { project } = await createProject();
    const raw = await sharp({ create: { width: 64, height: 64, channels: 4, background: "#ff00ffff" } })
      .composite([{ input: Buffer.from('<svg width="24" height="32"><rect width="24" height="32" fill="#305080"/></svg>'), left: 20, top: 16 }]).png().toBuffer();
    server = createServer(async (request, response) => {
      expect(request.headers.authorization).toBe("Bearer test-key");
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify({ data: [{ b64_json: raw.toString("base64") }] }));
    });
    await new Promise((done) => server.listen(0, "127.0.0.1", done));
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const generated = await generateAssets(project, { write: true, apiKey: "test-key", baseUrl, model: "test-image" });
    expect(generated.results).toHaveLength(2);
    expect(JSON.parse(await readFile(generated.card_config, "utf8"))).toHaveLength(1);
    expect((await processAssets(project)).results).toHaveLength(2);
    expect(await previewAssets(project)).toMatchObject({ passed: true, assets: 2 });
    expect(await validateAssets(project, { strict: true })).toMatchObject({ passed: false, errors: [{ code: "duplicate_image" }] });
  });
});
