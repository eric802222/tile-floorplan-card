# Asset manifest schema

`schema_version` must be `1`. The top level accepts:

- `tile_size`: logical pixel grid; defaults to `16`.
- `image_size`: provider request size; defaults to `1024x1024`.
- `style_prompt`: shared perspective, palette, outline and lighting rules.
- `background_prompt`: isolation or chroma-key requirement.
- `output_dir`: directory under the manifest directory.
- `raw_dir`: provider output before deterministic processing; use a different
  directory from `output_dir` for production workflows.
- `card_asset_base`: Home Assistant `/local/...` URL prefix.
- `quality`: optional OpenAI-compatible quality value.
- `max_colors`: production palette limit; defaults to `64`.
- `chroma_color`, `chroma_tolerance`: background removal color and distance.
- `alpha_threshold`: converts soft alpha edges to either transparent or opaque.
- `anchor`: `bottom` for furniture/devices or `center` for effects.
- `assets`: one or more asset definitions.

Each asset requires:

- `id`: lowercase letters, digits, hyphens or underscores; stable and unique.
- `width`, `height`: positive logical tile dimensions.
- `prompt`: the object's identity and construction, without repeating global style.
- `states.default`: the base state. Other keys correspond to Home Assistant states.

Optional asset fields include `name`, `tags`, `size` and `quality`. Each state may
override `prompt`, `size` and `quality`.

The generator creates `<asset-id>-<state>.png` and an `assets.card.json` fragment.
Providers must accept an OpenAI-compatible JSON images request and return either
`data[0].b64_json` or `data[0].url`.

Strict validation requires final PNG dimensions to equal `width × tile_size` by
`height × tile_size`, an alpha channel, no partial-alpha edge pixels, no remaining
magenta chroma key, and no more than `max_colors` visible RGBA colors.
