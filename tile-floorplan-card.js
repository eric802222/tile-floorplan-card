class FloorplanCard extends HTMLElement {
    setConfig(config) {
      if (!config.grid) {
        throw new Error("You need to define a grid with width and height");
      }
      this.config = config;
      this.attachShadow({ mode: "open" });
    }
  
    set hass(hass) {
      this._hass = hass;
      this.render();
    }

    _isEditMode() {
      return this._hass?.editMode;
    }
  
  render() {
    if (!this._hass || !this.config) return;
    const grid = this.config.grid;
    const objects = (this.config.objects || []).sort((a, b) => a.z - b.z);
  
      const style = `
        <style>
          .floorplan {
            position: relative;
            width: 100%;
            aspect-ratio: ${grid.width}/${grid.height};
            background: url(${grid.background}) no-repeat;
            background-size: cover;
            image-rendering: pixelated;
          }
          .object {
            position: absolute;
            cursor: pointer;
          }
          .grid-lines {
            pointer-events: none;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image:
              linear-gradient(to right, rgba(0,0,0,0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.3) 1px, transparent 1px);
            background-size: calc(100% / ${grid.width}) calc(100% / ${grid.height});
            background-repeat: repeat;
            z-index: 1000;
          }
          .coord {
            position: absolute;
            font-size: 10px;
            color: #000;
            background: rgba(255,255,255,0.7);
            padding: 1px 2px;
            pointer-events: none;
            z-index: 1001;
          }
        </style>
      `;
  
      let html = `<div class="floorplan">`;

      if (this._isEditMode()) {
        html += `<div class="grid-lines"></div>`;
        for (let y = 0; y < grid.height; y++) {
          for (let x = 0; x < grid.width; x++) {
            const left = (x / grid.width) * 100;
            const top = (y / grid.height) * 100;
            html += `<div class="coord" style="left:${left}%; top:${top}%">${x},${y}</div>`;
          }
        }
      }
  
      for (const obj of objects) {
        let img = obj.images?.default;
  
        // 如果是 entity
        if (obj.type === "entity" && obj.entity_id) {
          const state = this._hass.states[obj.entity_id]?.state || "off";
          img = obj.images?.[state] || img;
        }
  
        // 如果有 conditions
        if (obj.conditions) {
          for (const cond of obj.conditions) {
            const state = this._hass.states[cond.if.entity_id]?.state;
            if (state === cond.if.state) img = cond.image;
          }
        }
  
        const left = (obj.x / grid.width) * 100;
        const top = (obj.y / grid.height) * 100;
        const width = ((obj.width || 1) / grid.width) * 100;
        const height = ((obj.height || 1) / grid.height) * 100;
  
        html += `
          <img src="${img}"
            class="object"
            style="
              left:${left}%;
              top:${top}%;
              width:${width}%;
              height:${height}%;
              z-index:${obj.z};
            "
            data-entity="${obj.entity_id || ""}"
          />
        `;
      }
  
      html += `</div>`;
  
      this.shadowRoot.innerHTML = style + html;
  
      // 綁定點擊事件
      this.shadowRoot.querySelectorAll(".object").forEach(el => {
        const entityId = el.dataset.entity;
        if (entityId) {
          el.addEventListener("click", () => {
            const domain = entityId.split(".")[0];
            const service = domain === "light" ? "toggle" : "toggle";
            this._hass.callService(domain, service, { entity_id: entityId });
          });
        }
      });
    }
  
    getCardSize() {
      return 5;
    }

    static async getConfigElement() {
      await import(new URL('./tile-floorplan-card-editor.js', import.meta.url));
      return document.createElement('ha-floorplan-card-editor');
    }

    static getStubConfig() {
      return {
        grid: {
          width: 5,
          height: 5,
          tile_size: 32,
          background: ''
        },
        objects: []
      };
    }
  }

  customElements.define("ha-floorplan-card", FloorplanCard);

  if (!window.customCards) window.customCards = [];
  window.customCards.push({
    type: "ha-floorplan-card",
    name: "Tile Floorplan Card",
    description: "RPG-style floor plan with clickable entities",
  });

