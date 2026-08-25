import { LitElement, css, html, nothing } from "lit";
import { clampObject, imageForObject, normalizeConfig, resolveObject } from "./config.js";
import { exportTiled, importTiled } from "./tiled.js";

export class TileFloorplanCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    config: { state: true },
    _selected: { state: true },
  };

  static styles = css`
    :host { display: block; }
    .editor { display: grid; gap: 16px; padding: 8px 0; }
    .settings { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    label { display: grid; gap: 4px; font-size: 12px; }
    input, select, textarea, button { box-sizing: border-box; font: inherit; }
    input, select, textarea { width: 100%; padding: 8px; }
    .wide { grid-column: 1 / -1; }
    .stage {
      position: relative; width: 100%; overflow: hidden;
      border: 1px solid var(--divider-color); border-radius: 8px;
      background-repeat: no-repeat; background-size: 100% 100%; background-position: top left;
      image-rendering: pixelated; touch-action: none;
    }
    .grid { position: absolute; inset: 0; pointer-events: none; }
    .sprite {
      position: absolute; padding: 0; border: 1px dashed transparent;
      background: transparent center / contain no-repeat; image-rendering: pixelated;
      cursor: grab; touch-action: none;
    }
    .sprite.selected { border-color: var(--primary-color); background-color: color-mix(in srgb, var(--primary-color) 15%, transparent); }
    .toolbar, .row { display: flex; gap: 8px; align-items: center; }
    .toolbar { justify-content: space-between; }
    .objects { display: grid; gap: 10px; }
    .asset-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; }
    .asset { display: grid; gap: 6px; padding: 8px; border: 1px solid var(--divider-color); border-radius: 8px; }
    .asset img { width: 100%; height: 64px; object-fit: contain; image-rendering: pixelated; background: var(--secondary-background-color); }
    .asset button { width: 100%; }
    details { border: 1px solid var(--divider-color); border-radius: 8px; padding: 8px; }
    summary { cursor: pointer; }
    .object-fields { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
    .object-fields .span-2 { grid-column: span 2; }
    .object-fields .span-4 { grid-column: 1 / -1; }
    .danger { color: var(--error-color); margin-left: auto; }
    .hint { color: var(--secondary-text-color); font-size: 12px; margin: 0; }
    @media (max-width: 520px) {
      .settings { grid-template-columns: 1fr; }
      .wide { grid-column: auto; }
      .object-fields { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .object-fields .span-4 { grid-column: 1 / -1; }
    }
  `;

  setConfig(config) {
    this.config = normalizeConfig(config);
    if (this._selected >= this.config.objects.length) this._selected = undefined;
  }

  _emit(config = this.config) {
    this.config = normalizeConfig(config);
    this.dispatchEvent(new CustomEvent("config-changed", {
      bubbles: true,
      composed: true,
      detail: { config: structuredClone(this.config) },
    }));
  }

  _setGrid(key, value) {
    this._emit({ ...this.config, grid: { ...this.config.grid, [key]: value } });
  }

  _updateObject(index, patch) {
    const objects = this.config.objects.map((object, i) => i === index ? { ...object, ...patch } : object);
    this._emit({ ...this.config, objects });
  }

  _updateImage(index, state, value) {
    const object = this.config.objects[index];
    this._updateObject(index, { images: { ...object.images, [state]: value } });
  }

  _addObject() {
    const index = this.config.objects.length;
    this._emit({
      ...this.config,
      objects: [...this.config.objects, {
        id: `object-${index + 1}`, type: "entity", entity_id: "",
        x: 0, y: 0, z: index, width: 1, height: 1,
        images: { default: "" }, tap_action: { action: "toggle" },
      }],
    });
    this._selected = index;
  }

  _addAsset() {
    const index = this.config.assets.length;
    this._emit({ ...this.config, assets: [...this.config.assets, {
      id: `asset-${index + 1}`, name: `Asset ${index + 1}`,
      width: 1, height: 1, images: { default: "" },
    }] });
  }

  _updateAsset(index, patch) {
    const previousId = this.config.assets[index].id;
    const assets = this.config.assets.map((asset, i) => i === index ? { ...asset, ...patch } : asset);
    const objects = patch.id && patch.id !== previousId
      ? this.config.objects.map(object => object.asset_id === previousId ? { ...object, asset_id: patch.id } : object)
      : this.config.objects;
    this._emit({ ...this.config, assets, objects });
  }

  _removeAsset(index) {
    this._emit({ ...this.config, assets: this.config.assets.filter((_, i) => i !== index) });
  }

  _placeAsset(asset) {
    const index = this.config.objects.length;
    this._emit({ ...this.config, objects: [...this.config.objects, {
      id: `${asset.id}-${index + 1}`, type: "virtual", asset_id: asset.id,
      x: 0, y: 0, z: index, width: asset.width, height: asset.height, images: {},
    }] });
    this._selected = index;
  }

  _downloadTiled() {
    const blob = new Blob([JSON.stringify(exportTiled(this.config), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "home-floorplan.tmj";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async _importTiled(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      this._emit(importTiled(JSON.parse(await file.text()), this.config));
      this._selected = undefined;
    } catch (error) {
      alert(`Unable to import Tiled map: ${error.message}`);
    } finally {
      event.target.value = "";
    }
  }

  _removeObject(index) {
    this._emit({ ...this.config, objects: this.config.objects.filter((_, i) => i !== index) });
    this._selected = undefined;
  }

  _dragStart(event, index) {
    event.preventDefault();
    this._selected = index;
    const stage = this.renderRoot.querySelector(".stage");
    const object = resolveObject(this.config.objects[index], this.config.assets);
    const rect = stage.getBoundingClientRect();
    const start = { x: event.clientX, y: event.clientY, object, rect };
    event.currentTarget.setPointerCapture(event.pointerId);

    const move = (moveEvent) => {
      const dx = ((moveEvent.clientX - start.x) / start.rect.width) * this.config.grid.width;
      const dy = ((moveEvent.clientY - start.y) / start.rect.height) * this.config.grid.height;
      const moved = clampObject({ ...start.object, x: Math.round(start.object.x + dx), y: Math.round(start.object.y + dy) }, this.config.grid);
      this._updateObject(index, { x: moved.x, y: moved.y });
    };
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end, { once: true });
  }

  _stageObject(object, index) {
    object = resolveObject(object, this.config.assets);
    const { grid } = this.config;
    const image = imageForObject(object, this.hass);
    const style = [
      `left:${object.x / grid.width * 100}%`, `top:${object.y / grid.height * 100}%`,
      `width:${object.width / grid.width * 100}%`, `height:${object.height / grid.height * 100}%`,
      `z-index:${object.z}`, image ? `background-image:url(${JSON.stringify(image)})` : "",
    ].join(";");
    return html`<button class="sprite ${this._selected === index ? "selected" : ""}"
      style=${style} title=${object.id} @pointerdown=${(event) => this._dragStart(event, index)}></button>`;
  }

  _objectForm(object, index) {
    const resolved = resolveObject(object, this.config.assets);
    const action = object.tap_action?.action || (object.entity_id ? "toggle" : "none");
    return html`<details ?open=${this._selected === index} @toggle=${(event) => {
      if (event.currentTarget.open) this._selected = index;
    }}>
      <summary>${object.id} — (${object.x}, ${object.y})</summary>
      <div class="object-fields">
        <label class="span-2">ID<input .value=${object.id} @change=${e => this._updateObject(index, { id: e.target.value })}></label>
        <label class="span-2">Entity ID<input .value=${object.entity_id || ""} @change=${e => this._updateObject(index, { entity_id: e.target.value })}></label>
        ${["x", "y", "z", "width", "height"].map(key => html`<label>${key}<input type="number" step=${key === "width" || key === "height" ? ".25" : "1"}
          .value=${String(resolved[key] ?? "")} @change=${e => this._updateObject(index, { [key]: Number(e.target.value) })}></label>`)}
        <label class="span-2">Asset<select .value=${object.asset_id || ""} @change=${e => this._updateObject(index, { asset_id: e.target.value })}>
          <option value="">None</option>${this.config.assets.map(asset => html`<option value=${asset.id}>${asset.name}</option>`)}
        </select></label>
        <label class="span-2">Default image<input .value=${object.images?.default || ""} @change=${e => this._updateImage(index, "default", e.target.value)}></label>
        <label>On image<input .value=${object.images?.on || ""} @change=${e => this._updateImage(index, "on", e.target.value)}></label>
        <label>Off image<input .value=${object.images?.off || ""} @change=${e => this._updateImage(index, "off", e.target.value)}></label>
        <label class="span-2">Tap action<select .value=${action} @change=${e => this._updateObject(index, { tap_action: { ...object.tap_action, action: e.target.value } })}>
          ${["none", "toggle", "more-info", "call-service", "navigate", "url"].map(value => html`<option value=${value}>${value}</option>`)}
        </select></label>
        ${action === "call-service" ? html`<label class="span-2">Service<input placeholder="light.turn_on" .value=${object.tap_action?.service || ""} @change=${e => this._updateObject(index, { tap_action: { ...object.tap_action, service: e.target.value } })}></label>` : nothing}
        ${action === "navigate" ? html`<label class="span-2">Navigation path<input .value=${object.tap_action?.navigation_path || ""} @change=${e => this._updateObject(index, { tap_action: { ...object.tap_action, navigation_path: e.target.value } })}></label>` : nothing}
        <button class="danger span-4" type="button" @click=${() => this._removeObject(index)}>Remove object</button>
      </div>
    </details>`;
  }

  render() {
    if (!this.config) return nothing;
    const { grid } = this.config;
    const stageStyle = [
      `aspect-ratio:${grid.width}/${grid.height}`,
      grid.background ? `background-image:url(${JSON.stringify(grid.background)})` : "",
    ].join(";");
    const gridStyle = [
      "background-image:linear-gradient(to right,rgba(0,0,0,.25) 1px,transparent 1px),linear-gradient(to bottom,rgba(0,0,0,.25) 1px,transparent 1px)",
      `background-size:${100 / grid.width}% ${100 / grid.height}%`,
    ].join(";");
    return html`<div class="editor">
      <div class="settings">
        <label>Grid width<input type="number" min="1" .value=${String(grid.width)} @change=${e => this._setGrid("width", Number(e.target.value))}></label>
        <label>Grid height<input type="number" min="1" .value=${String(grid.height)} @change=${e => this._setGrid("height", Number(e.target.value))}></label>
        <label>Tile size<input type="number" min="1" .value=${String(grid.tile_size)} @change=${e => this._setGrid("tile_size", Number(e.target.value))}></label>
        <label>Show grid<input type="checkbox" .checked=${this.config.show_grid} @change=${e => this._emit({ ...this.config, show_grid: e.target.checked })}></label>
        <label class="wide">Background URL<input .value=${grid.background} @change=${e => this._setGrid("background", e.target.value)}></label>
      </div>
      <p class="hint">Drag objects on the preview. Positions snap to the 16×16 logical grid.</p>
      <div class="stage" style=${stageStyle}>
        ${this.config.objects.map((object, index) => this._stageObject(object, index))}
        <div class="grid" style=${gridStyle}></div>
      </div>
      <div class="toolbar"><strong>Asset library (${this.config.assets.length})</strong><button type="button" @click=${this._addAsset}>Add asset</button></div>
      <div class="asset-grid">${this.config.assets.map((asset, index) => html`
        <div class="asset">
          ${asset.images?.default ? html`<img src=${asset.images.default} alt=${asset.name}>` : html`<div class="hint">No image</div>`}
          <input aria-label="Asset ID" .value=${asset.id} @change=${e => this._updateAsset(index, { id: e.target.value })}>
          <input aria-label="Asset name" .value=${asset.name} @change=${e => this._updateAsset(index, { name: e.target.value })}>
          <input aria-label="Asset image" placeholder="Image URL" .value=${asset.images?.default || ""} @change=${e => this._updateAsset(index, { images: { ...asset.images, default: e.target.value } })}>
          <div class="row"><input aria-label="Asset width" type="number" min=".25" step=".25" .value=${String(asset.width)} @change=${e => this._updateAsset(index, { width: Number(e.target.value) })}>
          <input aria-label="Asset height" type="number" min=".25" step=".25" .value=${String(asset.height)} @change=${e => this._updateAsset(index, { height: Number(e.target.value) })}></div>
          <button type="button" @click=${() => this._placeAsset(asset)}>Place</button>
          <button class="danger" type="button" @click=${() => this._removeAsset(index)}>Remove</button>
        </div>`)}
      </div>
      <div class="toolbar"><strong>Tiled</strong><div class="row">
        <label><span class="hint">Import .tmj</span><input type="file" accept=".tmj,.json,application/json" @change=${this._importTiled}></label>
        <button type="button" @click=${this._downloadTiled}>Export .tmj</button>
      </div></div>
      <div class="toolbar"><strong>Objects (${this.config.objects.length})</strong><button type="button" @click=${this._addObject}>Add object</button></div>
      <div class="objects">${this.config.objects.map((object, index) => this._objectForm(object, index))}</div>
    </div>`;
  }
}
