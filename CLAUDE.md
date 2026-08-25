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
