class FloorplanCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    if (!this.isConnected) return;
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (!this._config) this._config = {
      type: 'custom:ha-floorplan-card'
    };
    if (!this._config.grid) this._config.grid = {};
    this.innerHTML = `
      <style>
        .form {
          padding: 16px;
        }
        .form label {
          display: block;
          margin-top: 8px;
        }
        .form input,
        .form textarea {
          width: 100%;
          box-sizing: border-box;
        }
      </style>
      <div class="form">
        <label>Grid Width</label>
        <input id="grid_width" type="number" value="${this._config.grid.width || ''}">
        <label>Grid Height</label>
        <input id="grid_height" type="number" value="${this._config.grid.height || ''}">
        <label>Tile Size</label>
        <input id="grid_tile_size" type="number" value="${this._config.grid.tile_size || ''}">
        <label>Background URL</label>
        <input id="grid_background" type="text" value="${this._config.grid.background || ''}">
        <label>Objects JSON</label>
        <textarea id="objects" rows="6">${this._config.objects ? JSON.stringify(this._config.objects, null, 2) : ''}</textarea>
      </div>
    `;
    this._attachListeners();
  }

  _attachListeners() {
    this.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('change', () => this._valueChanged());
    });
  }

  _valueChanged() {
    const width = parseInt(this.querySelector('#grid_width').value || '0');
    const height = parseInt(this.querySelector('#grid_height').value || '0');
    const tileSize = parseInt(this.querySelector('#grid_tile_size').value || '0');
    const background = this.querySelector('#grid_background').value || '';
    let objects = [];
    const objText = this.querySelector('#objects').value;
    try {
      objects = objText ? JSON.parse(objText) : [];
    } catch(e) {
      // ignore JSON errors
    }
    this._config = {
      type: 'custom:ha-floorplan-card',
      grid: {
        width,
        height,
        tile_size: tileSize,
        background,
      },
      objects,
    };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
  }
}
customElements.define('ha-floorplan-card-editor', FloorplanCardEditor);
