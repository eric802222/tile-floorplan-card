class FloorplanCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    if (!Array.isArray(this._config.objects)) this._config.objects = [];
    if (!this.isConnected) return;
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  _renderObject(obj, index) {
    return `
      <div class="object-item" data-index="${index}">
        <img class="preview" src="${obj.images?.default || ''}" alt="">
        <input class="obj-id" placeholder="id" value="${obj.id || ''}">
        <select class="obj-type">
          <option value="entity" ${obj.type === 'entity' ? 'selected' : ''}>entity</option>
          <option value="virtual" ${obj.type === 'virtual' ? 'selected' : ''}>virtual</option>
        </select>
        <input class="entity_id" placeholder="entity_id" value="${obj.entity_id || ''}">
        <input class="x" type="number" placeholder="x" value="${obj.x ?? ''}">
        <input class="y" type="number" placeholder="y" value="${obj.y ?? ''}">
        <input class="z" type="number" placeholder="z" value="${obj.z ?? ''}">
        <input class="width" type="number" placeholder="w" value="${obj.width ?? 1}">
        <input class="height" type="number" placeholder="h" value="${obj.height ?? 1}">
        <input class="img-default" placeholder="image" value="${obj.images?.default || ''}">
        <button class="remove-object">Remove</button>
      </div>`;
  }

  render() {
    if (!this._config) this._config = { type: 'custom:ha-floorplan-card', grid: {}, objects: [] };
    if (!this._config.grid) this._config.grid = {};
    if (!Array.isArray(this._config.objects)) this._config.objects = [];
    const objectsHtml = this._config.objects.map((o, i) => this._renderObject(o, i)).join('');
    this.innerHTML = `
      <style>
        .form { padding: 16px; }
        .form label { display: block; margin-top: 8px; }
        .form input, .form select { width: 100%; box-sizing: border-box; }
        .object-item { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-top: 8px; }
        .object-item img.preview { width: 40px; height: 40px; object-fit: contain; }
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
        <div class="objects">${objectsHtml}</div>
        <button class="add-object" type="button">Add Item</button>
      </div>
    `;
    this._attachListeners();
  }

  _attachListeners() {
    this.querySelector('.add-object')?.addEventListener('click', () => {
      this._config.objects.push({ type: 'entity', images: { default: '' }, x: 0, y: 0, z: 0, width: 1, height: 1 });
      this.render();
      this._emitChange();
    });

    this.querySelectorAll('.remove-object').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.parentElement.dataset.index);
        this._config.objects.splice(idx, 1);
        this.render();
        this._emitChange();
      });
    });

    this.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('change', () => this._valueChanged());
    });
  }

  _valueChanged() {
    const width = parseInt(this.querySelector('#grid_width').value || '0');
    const height = parseInt(this.querySelector('#grid_height').value || '0');
    const tileSize = parseInt(this.querySelector('#grid_tile_size').value || '0');
    const background = this.querySelector('#grid_background').value || '';

    const objects = [];
    this.querySelectorAll('.object-item').forEach(item => {
      const obj = {
        id: item.querySelector('.obj-id').value,
        type: item.querySelector('.obj-type').value,
        entity_id: item.querySelector('.entity_id').value,
        x: parseInt(item.querySelector('.x').value || '0'),
        y: parseInt(item.querySelector('.y').value || '0'),
        z: parseInt(item.querySelector('.z').value || '0'),
        width: parseInt(item.querySelector('.width').value || '1'),
        height: parseInt(item.querySelector('.height').value || '1'),
        images: { default: item.querySelector('.img-default').value }
      };
      item.querySelector('.preview').src = obj.images.default;
      objects.push(obj);
    });

    this._config = {
      type: 'custom:ha-floorplan-card',
      grid: { width, height, tile_size: tileSize, background },
      objects,
    };
    this._emitChange();
  }

  _emitChange() {
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
  }
}
customElements.define('ha-floorplan-card-editor', FloorplanCardEditor);
