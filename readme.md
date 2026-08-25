# HA Floorplan Card 🗺️

A Home Assistant Lovelace card for creating **RPG-style floor plans** with grid-based tiles, entities, and conditional virtual objects.

## ✨ Features
- Define grid size (rows × cols × tile size)
- Use an external image as the floor plan background
- Place HA entities on specific coordinates (x, y, z)
- Conditional rendering of entity/virtual object images
- Virtual objects (non-entity) for effects like shadows, highlights, or decorations
- Click on entities to toggle or perform HA services
- Responsive layout that scales to the width of its container
- Optional overlay with grid lines and coordinate labels for easier placement
- Editor now supports multiple state-based images per object
- Drag-and-drop object positioning with grid snapping
- Configurable Home Assistant tap actions
- Safe, non-destructive editing that preserves conditions and custom fields
- Reusable RPG asset library with state image overrides
- Tiled `.tmj` import and export


## 📦 Installation via HACS
1. Go to HACS → Frontend → Custom Repositories
2. Add repository:  
https://github.com/eric802222/tile-floorplan-card
Category: Lovelace
3. Search for **Tile Floorplan Card** in HACS and install
4. Add resource in **Lovelace → Resources**:
url: /hacsfiles/tile-floorplan-card/tile-floorplan-card.js
type: module

The editor interface is bundled with the same JS file, so no extra resources are
needed. After adding the resource, you can create the card directly from the
Lovelace UI by selecting **Tile Floorplan Card** from the card picker. A basic
editor lets you adjust grid settings and manage objects in JSON form without
editing YAML.

## ⚙️ Example Configuration
type: custom:ha-floorplan-card
grid:
  width: 20
  height: 15
  tile_size: 32  # optional, kept for backward compatibility
  background: /local/floorplans/livingroom.png
show_grid: true
objects:
  - id: lamp_1
    type: entity
    entity_id: light.living_room
    x: 5
    y: 8
    z: 2
    width: 1
    height: 1
    images:
      on: /local/icons/lamp_on.png
      off: /local/icons/lamp_off.png
    tap_action:
      action: toggle

  - id: shadow_area
    type: virtual
    x: 3
    y: 4
    z: 1
    width: 4
    height: 2
    images:
      default: /local/effects/shadow.png
    conditions:
      - if:
          entity_id: switch.night_mode
          state: on
        image: /local/effects/shadow_night.png

## 🎮 Visual RPG Map Editor

The Lovelace editor includes an interactive map preview. Drag an object to snap
it to the logical grid, then fine-tune its coordinates, size and layer in the
object form. The default tile size is 16 pixels, matching classic handheld RPG
asset workflows, while the card remains responsive on phones and tablets.

Supported tap actions:

- `toggle`
- `more-info`
- `call-service`
- `navigate`
- `url`
- `none`

Existing configurations remain compatible. Unknown object fields and
`conditions` are preserved when the visual editor changes another property.

## 🧩 Reusable Assets

Define furniture and device art once, then place it multiple times with
`asset_id`. A placed object can override only the state images that differ.

```yaml
assets:
  - id: floor-lamp
    name: Floor Lamp
    width: 1
    height: 2
    images:
      default: /local/rpg/lamp-off.png
      on: /local/rpg/lamp-on.png

objects:
  - id: living-room-lamp
    type: entity
    entity_id: light.living_room
    asset_id: floor-lamp
    x: 8
    y: 5
    z: 4
```

The editor asset library can add, preview, resize and place these reusable
items. Asset IDs are updated safely across placed objects when renamed.

## 🗺️ Tiled Interchange

Use **Export .tmj** in the card editor to open the map in
[Tiled](https://www.mapeditor.org/). Home Assistant metadata is stored as Tiled
object properties, including `entity_id`, `asset_id`, `z`, state images,
conditions and tap actions. Import the edited `.tmj` file to bring positions,
dimensions and metadata back into the card.

Tiled uses pixel coordinates while the card uses logical grid coordinates. The
converter applies `tile_size` automatically, so a position at `(64, 96)` in a
16-pixel Tiled map becomes `(4, 6)` in the card.

## 🤖 Claude Code and AI Asset Generation

Claude Code is the workflow orchestrator. The card does not call an LLM or
image provider and never stores API credentials. A local CLI reads a versioned
asset manifest and calls any image service implementing the OpenAI-compatible
`/v1/images/generations` request and response shape.

```bash
cp assets/manifest.example.json assets/manifest.json

# Inspect every generated request without credentials
npm run assets:dry-run -- assets/manifest.json

# Generate with an OpenAI-compatible provider
AI_BASE_URL=https://provider.example \
AI_API_KEY=your-key \
AI_IMAGE_MODEL=your-image-model \
npm run assets:generate -- assets/manifest.json
```

Optional `AI_IMAGE_PATH` overrides the default `/v1/images/generations`
endpoint. Providers may return either `data[0].b64_json` or `data[0].url`.
Generated files use stable names such as `floor-lamp-default.png` and
`floor-lamp-on.png`; `assets.card.json` contains the reusable Card asset config.

Raw provider output should not be used directly in the map. The deterministic
post-processing and visual review steps are:

```bash
npm run assets:process -- assets/manifest.json
npm run assets:preview -- assets/manifest.json
npm run assets:validate -- assets/manifest.json --strict
```

`assets:process` removes the configured chroma color, converts soft alpha edges
to pixel-art transparency, trims the subject, scales with nearest-neighbor
sampling, anchors it on the logical canvas and constrains the PNG palette.

`assets:preview` creates `contact-sheet.png`, showing every asset and state at a
consistent review scale. Claude Code should inspect this sheet for inconsistent
identity, lighting, perspective and relative size before accepting the set.

This separation keeps the UI provider-independent: switching from one hosted
model, proxy, gateway or local OpenAI-compatible server requires environment
changes only, not a new HACS build.

### Validation reports

Before accepting generated art, validate every expected state and production
constraint:

```bash
npm run assets:validate -- assets/manifest.json
npm run assets:validate -- assets/manifest.json --strict --report assets-report.json
npm run map:validate -- card-config.json --report map-report.json
npm run map:validate -- home-floorplan.tmj
```

Asset validation checks missing/corrupt files, PNG format, logical dimensions,
alpha-channel quality, remaining chroma-key pixels, palette size and identical
state images. Non-strict mode reports production-quality findings as warnings;
`--strict` turns them into failures.

Map validation checks duplicate IDs, unknown `asset_id` references, map bounds,
Home Assistant Entity ID syntax and supported actions. Both commands emit stable
JSON reports so Claude Code can decide whether to regenerate an image, run a
post-processing tool, or only correct map configuration.

## 🛠️ Development

```bash
npm install
npm test
npm run build
```

The source lives in `src/`. Vite bundles Lit and the card into the single
`tile-floorplan-card.js` file consumed by HACS.

## 📄 License
MIT License
