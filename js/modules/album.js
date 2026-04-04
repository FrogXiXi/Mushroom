/**
 * 相册模块 - 管理截图保存与浏览
 * 照片先保存到相册（IndexedDB），再可选保存到本地
 */
const AlbumModule = {
  _DB_NAME: 'zzhappy-album',
  _DB_VERSION: 1,
  _STORE_NAME: 'photos',
  _items: [],
  _selectedIdx: -1,
  _db: null,

  /** 打开 IndexedDB */
  async _openDB() {
    if (this._db) {
      return this._db;
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this._DB_NAME, this._DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this._STORE_NAME)) {
          const store = db.createObjectStore(this._STORE_NAME, { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
      request.onsuccess = (event) => {
        this._db = event.target.result;
        resolve(this._db);
      };
      request.onerror = () => reject(request.error);
    });
  },

  /** 保存截图到相册 */
  async savePhoto(dataUrl, template) {
    const db = await this._openDB();
    const maxItems = CONFIG.albumMaxItems || 20;

    // 先检查数量限制
    const count = await this._getCount(db);
    if (count >= maxItems) {
      // 删除最旧的一张
      await this._deleteOldest(db);
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(this._STORE_NAME, 'readwrite');
      const store = tx.objectStore(this._STORE_NAME);
      const item = {
        dataUrl,
        template: template || 'polaroid',
        timestamp: Date.now(),
      };
      const request = store.add(item);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async _getCount(db) {
    return new Promise((resolve) => {
      const tx = db.transaction(this._STORE_NAME, 'readonly');
      const store = tx.objectStore(this._STORE_NAME);
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(0);
    });
  },

  async _deleteOldest(db) {
    return new Promise((resolve) => {
      const tx = db.transaction(this._STORE_NAME, 'readwrite');
      const store = tx.objectStore(this._STORE_NAME);
      const index = store.index('timestamp');
      const request = index.openCursor();
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
        }
        resolve();
      };
      request.onerror = () => resolve();
    });
  },

  /** 获取所有照片 */
  async getAllPhotos() {
    const db = await this._openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(this._STORE_NAME, 'readonly');
      const store = tx.objectStore(this._STORE_NAME);
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');
      const items = [];
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          items.push(cursor.value);
          cursor.continue();
        } else {
          resolve(items);
        }
      };
      request.onerror = () => resolve([]);
    });
  },

  /** 删除一张照片 */
  async deletePhoto(id) {
    const db = await this._openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(this._STORE_NAME, 'readwrite');
      const store = tx.objectStore(this._STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  },

  /** 初始化相册 UI */
  async init() {
    this._selectedIdx = -1;
    this._items = await this.getAllPhotos();
    this._render();
    this._bindEvents();
  },

  _render() {
    const grid = document.getElementById('album-grid');
    const preview = document.getElementById('album-preview');
    const actions = document.getElementById('album-actions');

    grid.innerHTML = '';
    if (this._items.length === 0) {
      grid.innerHTML = '<p class="album-empty">还没有照片，去制作蛋糕吧～</p>';
      preview.innerHTML = '';
      actions.classList.add('hidden');
      return;
    }

    this._items.forEach((item, index) => {
      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = `album-thumb${index === this._selectedIdx ? ' selected' : ''}`;
      thumb.innerHTML = `<img src="${item.dataUrl}" alt="照片 ${index + 1}" draggable="false">`;
      thumb.onclick = () => {
        this._selectedIdx = index;
        this._render();
      };
      grid.appendChild(thumb);
    });

    if (this._selectedIdx >= 0 && this._selectedIdx < this._items.length) {
      const selected = this._items[this._selectedIdx];
      preview.innerHTML = `<img src="${selected.dataUrl}" alt="预览">`;
      actions.classList.remove('hidden');
    } else {
      preview.innerHTML = '<p class="album-hint">选择一张照片查看</p>';
      actions.classList.add('hidden');
    }
  },

  _bindEvents() {
    document.getElementById('album-save-local').onclick = () => {
      if (this._selectedIdx < 0 || this._selectedIdx >= this._items.length) {
        return;
      }
      const item = this._items[this._selectedIdx];
      const link = document.createElement('a');
      link.download = `birthday_cake_${Date.now()}.png`;
      link.href = item.dataUrl;
      link.click();
      Utils.showToast('已保存到本地', 1500);
    };

    document.getElementById('album-delete').onclick = async () => {
      if (this._selectedIdx < 0 || this._selectedIdx >= this._items.length) {
        return;
      }
      const item = this._items[this._selectedIdx];
      await this.deletePhoto(item.id);
      this._items.splice(this._selectedIdx, 1);
      this._selectedIdx = -1;
      this._render();
      Utils.showToast('已删除', 1200);
    };

    document.getElementById('album-close').onclick = () => {
      document.getElementById('album-overlay').classList.add('hidden');
    };
  },

  /** 打开相册面板 */
  async open() {
    this._items = await this.getAllPhotos();
    this._selectedIdx = this._items.length > 0 ? 0 : -1;
    document.getElementById('album-overlay').classList.remove('hidden');
    this._render();
    this._bindEvents();
  },

  destroy() {},
};
