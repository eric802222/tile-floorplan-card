class FloorplanCard extends HTMLElement {
    setConfig(config) {
      if (!config.grid) {
        throw new Error("You need to define a grid with width, height, and tile_size");
      }
      this.config = config;
      this.attachShadow({ mode: "open" });
    }
  
    set hass(hass) {
      this._hass = hass;
      this.render();
    }
  
    render() {
      if (!this._hass || !this.config) return;
      const grid = this.config.grid;
      const objects = (this.config.objects || []).sort((a, b) => a.z - b.z);
  
      const style = `
        <style>
          .floorplan {
            position: relative;
            width: ${grid.width * grid.tile_size}px;
            height: ${grid.height * grid.tile_size}px;
            background: url(${grid.background}) no-repeat;
            background-size: cover;
            image-rendering: pixelated;
          }
          .object {
            position: absolute;
            cursor: pointer;
          }
        </style>
      `;
  
      let html = `<div class="floorplan">`;
  
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
  
        const left = obj.x * grid.tile_size;
        const top = obj.y * grid.tile_size;
        const width = (obj.width || 1) * grid.tile_size;
        const height = (obj.height || 1) * grid.tile_size;
  
        html += `
          <img src="${img}"
            class="object"
            style="
              left:${left}px;
              top:${top}px;
              width:${width}px;
              height:${height}px;
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
  }
  
  customElements.define("ha-floorplan-card", FloorplanCard);
  
