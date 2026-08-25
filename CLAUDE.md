# Claude Code workflow

This repository uses Claude Code as the planning and orchestration agent. Image
generation is provider-agnostic and must use an OpenAI-compatible images schema.

For asset or map artwork tasks, load `.claude/skills/home-rpg-assets/SKILL.md`.

## Rules

- Never put API keys or image-provider calls in the Home Assistant card bundle.
- Read and validate `assets/manifest.json` before generating anything.
- Keep the logical grid at 16 pixels unless the project manifest says otherwise.
- Generate isolated assets, not a complete floor plan.
- Preserve the real home's room layout, orientation and furniture positions.
- Use original handheld-era RPG art; do not copy proprietary game assets.
- Run `npm test` and `npm run build` after source changes.

## Generate assets

```bash
cp assets/manifest.example.json assets/manifest.json
AI_BASE_URL=https://provider.example \
AI_API_KEY=... \
AI_IMAGE_MODEL=image-model \
npm run assets:generate -- assets/manifest.json
```

Use `npm run assets:dry-run -- assets/manifest.json` to inspect prompts and
requests without credentials or network calls. After generation, run
`assets:process`, `assets:preview`, and strict `assets:validate` in that order.
Copy processed PNGs into Home Assistant's `/config/www/rpg/`; merge
`assets.card.json` into the card config.

Before deployment, render the complete map with representative Home Assistant
states and inspect both the PNG and its JSON report:

```bash
npm run map:render -- card-config.json \
  --www-root /config/www \
  --states assets/states.example.json \
  --output map-preview.png
```

For state coverage and visual regression, keep a reviewed scenario set and PNG
baselines in version control:

```bash
cp assets/scenarios.example.json assets/scenarios.json
npm run map:scenarios -- card-config.json --www-root /config/www \
  --scenarios assets/scenarios.json --output-dir map-scenarios
npm run map:diff -- map-scenarios/evening.png baselines/evening.png \
  --max-ratio 0 --threshold 0
npm run map:regress -- --scenarios-report map-scenarios/scenarios.report.json \
  --baseline-dir baselines --diff-dir map-diffs --max-ratio 0
```

Review `overview.png`, then review each diff report and its highlighted PNG. Update a
baseline only when the map change is intentional; never hide a regression by raising
the threshold without documenting why.

Use `map:regress` in CI. It compares the complete scenario report, fails on missing
baselines, lists stale baseline PNGs, and writes one aggregate JSON report. Upload
`map-diffs/` and `map-regression.report.json` as CI artifacts when the job fails.
