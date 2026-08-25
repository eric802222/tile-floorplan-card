import { LitElement, css, html, nothing } from "lit";
import { actionForObject, imageForObject, normalizeConfig } from "./config.js";
import { executeAction } from "./actions.js";

export class TileFloorplanCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    config: { state: true },
  };

  static styles = css`
    :host { display: block; }
    ha-card { overflow: hidden; }
    .floorplan {
      position: relative;
      width: 100%;
      background-repeat: no-repeat;
      background-position: top left;
      background-size: 100% 100%;
      image-rendering: pixelated;
      overflow: hidden;
      touch-action: manipulation;
    }
    .object {
      position: absolute;
      display: block;
      padding: 0;
      border: 0;
      background-color: transparent;
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      image-rendering: pixelated;
    }
    button.object { cursor: pointer; }
    .grid-lines {
      pointer-events: none;
      position: absolute;
      inset: 0;
      z-index: 100000;
    }
  `;

  setConfig(config) {
    if (!config?.grid) throw new Error("You need to define a grid with width and height");
    this.config = normalizeConfig(config);
  }

  static getConfigElement() {
    return document.createElement("ha-floorplan-card-editor");
  }

  static getStubConfig() {
    return structuredClone(normalizeConfig());
  }

  getCardSize() {
    return Math.max(1, Math.ceil((this.config?.grid?.height || 5) / 3));
  }

  _runAction(object) {
    executeAction(this, this.hass, object, actionForObject(object));
  }

  _objectTemplate(object) {
    const grid = this.config.grid;
    const image = imageForObject(object, this.hass);
    if (!image) return nothing;
    const style = [
      `left:${(object.x / grid.width) * 100}%`,
      `top:${(object.y / grid.height) * 100}%`,
      `width:${(object.width / grid.width) * 100}%`,
      `height:${(object.height / grid.height) * 100}%`,
      `z-index:${object.z}`,
      `background-image:url(${JSON.stringify(image)})`,
    ].join(";");
    const interactive = actionForObject(object).action !== "none";
    return interactive
      ? html`<button class="object" style=${style} title=${object.name || object.id}
          aria-label=${object.name || object.id} @click=${() => this._runAction(object)}></button>`
      : html`<div class="object" style=${style} title=${object.name || object.id}></div>`;
  }

  render() {
    if (!this.config || !this.hass) return nothing;
    const { grid } = this.config;
    const objects = [...this.config.objects].sort((a, b) => a.z - b.z);
    const floorplanStyle = [
      `aspect-ratio:${grid.width}/${grid.height}`,
      grid.background ? `background-image:url(${JSON.stringify(grid.background)})` : "",
    ].join(";");
    const overlayStyle = [
      `background-image:linear-gradient(to right,rgba(0,0,0,.28) 1px,transparent 1px),linear-gradient(to bottom,rgba(0,0,0,.28) 1px,transparent 1px)`,
      `background-size:${100 / grid.width}% ${100 / grid.height}%`,
    ].join(";");

    return html`<ha-card>
      <div class="floorplan" style=${floorplanStyle}>
        ${objects.map((object) => this._objectTemplate(object))}
        ${this.config.show_grid ? html`<div class="grid-lines" style=${overlayStyle}></div>` : nothing}
      </div>
    </ha-card>`;
  }
}
