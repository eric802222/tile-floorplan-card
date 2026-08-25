import { TileFloorplanCard } from "./card.js";
import { TileFloorplanCardEditor } from "./editor.js";

if (!customElements.get("ha-floorplan-card-editor")) {
  customElements.define("ha-floorplan-card-editor", TileFloorplanCardEditor);
}
if (!customElements.get("ha-floorplan-card")) {
  customElements.define("ha-floorplan-card", TileFloorplanCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "ha-floorplan-card")) {
  window.customCards.push({
    type: "ha-floorplan-card",
    name: "Tile Floorplan Card",
    description: "RPG-style floor plan with clickable Home Assistant entities",
    preview: true,
  });
}
