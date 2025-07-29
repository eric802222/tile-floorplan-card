# HA Floorplan Card 🗺️

A Home Assistant Lovelace card for creating **RPG-style floor plans** with grid-based tiles, entities, and conditional virtual objects.

## ✨ Features
- Define grid size (rows × cols × tile size)
- Use an external image as the floor plan background
- Place HA entities on specific coordinates (x, y, z)
- Conditional rendering of entity/virtual object images
- Virtual objects (non-entity) for effects like shadows, highlights, or decorations
- Click on entities to toggle or perform HA services


## 📦 Installation via HACS
1. Go to HACS → Frontend → Custom Repositories
2. Add repository:  
https://github.com/eric802222/tile-floorplan-card
Category: Lovelace
3. Search for **Tile Floorplan Card** in HACS and install
4. Add resource in **Lovelace → Resources**:
url: /hacsfiles/tile-floorplan-card/tile-floorplan-card.js
type: module

HACS will also fetch `tile-floorplan-card-editor.js`, which provides the card's
Lovelace editor interface.

After adding the resource, you can create the card directly from the Lovelace UI
by selecting **Tile Floorplan Card** from the card picker. A basic editor lets yo
u adjust grid settings and manage objects in JSON form without editing YAML.

## ⚙️ Example Configuration
type: custom:ha-floorplan-card
grid:
  width: 20
  height: 15
  tile_size: 32
  background: /local/floorplans/livingroom.png
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

## 📄 License
MIT License
