---
name: home-rpg-assets
description: Create and maintain original top-down RPG assets for tile-floorplan-card, including manifests, state variants, Tiled placement, and Home Assistant entity mappings. Use for furniture, rooms, devices, effects, pets, tilesets, or floorplan asset work; do not use for generic Home Assistant configuration unrelated to the RPG map.
---

# Home RPG assets

Build the map from reusable assets. Do not generate a finished floorplan image when
individual tiles, furniture or state variants would preserve editability.

## Invariants

- Preserve the real home's layout, orientation and furniture positions.
- Use a 16 px logical grid by default. Common objects are 16×16, 16×32 or 32×32.
- Produce original handheld-era top-down RPG art; never copy proprietary game assets.
- Keep credentials and provider calls outside the Home Assistant frontend bundle.
- Treat Claude Code as the orchestrator. Do not add another conversational LLM layer.
- Access image generation only through `tools/generate-assets.js` or another explicitly
  OpenAI-compatible tool adapter.
- Do not make a paid generation request unless the user requested generation. A dry run
  and validation are safe preparation steps.

## Workflow

1. Inspect the current map config, Tiled map and `assets/manifest.json` when present.
2. Identify missing reusable assets and their meaningful Home Assistant states.
3. Update the manifest with stable lowercase IDs, logical dimensions and concise prompts.
4. Run `npm run assets:dry-run -- assets/manifest.json` and review every job.
5. When generation is authorized and provider variables are configured, run
   `npm run assets:generate -- assets/manifest.json`.
6. Check that every expected PNG and `assets.card.json` exists. Reject inconsistent
   scale, perspective, lighting or state identity rather than compensating in the map.
7. Add the assets to the card config and place them through the editor or Tiled.
8. Run tests and build the HACS bundle after source changes.

Read [references/manifest-schema.md](references/manifest-schema.md) when creating or
debugging a manifest. Read the repository `CLAUDE.md` for commands and environment
variables.
