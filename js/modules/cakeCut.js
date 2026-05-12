/**
 * 模块8: 切蛋糕互动
 * 固定 8 等分模型：从完整 DIY 蛋糕画布裁出 8 片，避免自由切线生成随机碎片。
 */
const CakeCutModule = {
  _pieces: [],
  _cutLine: [],
  _knifeDragging: false,
  _sceneCanvas: null,
  _fullMaskCanvas: null,
  _cakeLayers: [],
  _decorationImages: new Map(),
  _creamStampImages: new Map(),
  _layout: null,
  _dragIdx: -1,
  _dragStart: null,
  _origOffset: null,
  _plateActive: false,
  _drawFrame: 0,
  _cleanupFns: [],

  async init() {
    this.canvas = document.getElementById('cut-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.cutArea = document.querySelector('.cut-area');
    this.hintEl = document.getElementById('cut-hint');
    this.knifeEl = document.getElementById('cut-knife');
    this.plateZone = document.getElementById('plate-dropzone');
    this.finishBtn = document.getElementById('plate-finish-btn');

    this._resizeCanvas(this.canvas);
    await this._loadAssets();
    this._buildSceneCanvas();
    this._rememberKnifeHome();
    this._initPieces();
    this._bindKnifeEvents();
    this._bindPieceDragEvents();
    this._bindUiEvents();
    this._updatePlateState();
    this._draw();

    this.hintEl.textContent = this._pieces.length > 1
      ? '已恢复 8 等分蛋糕，可以把蛋糕拖到盘子里'
      : '拖动蛋糕刀，在蛋糕上画一刀切成固定 8 等分';
    this.knifeEl.classList.add('active');
  },

  async _loadAssets() {
    this._cakeLayers = await Utils.loadCakeLayers(App.state.cakeType || 'single');
    this._decorationImages = await Utils.loadDecorationImagesForState(App.state.decorations || []);
    this._creamStampImages = new Map();
    await Promise.all(CONFIG.creamStampColors.map(async (stamp) => {
      try {
        const image = await Utils.loadImage(stamp.src);
        this._creamStampImages.set(stamp.src, image);
      } catch (error) {
        console.warn('cream stamp load failed', stamp.src, error);
      }
    }));
  },

  _resizeCanvas(canvas) {
    Utils.resizeCanvasToDisplaySize(canvas, { minWidth: 340, minHeight: 420 });
  },

  _buildSceneCanvas() {
    this._sceneCanvas = document.createElement('canvas');
    this._sceneCanvas.width = this.canvas.width;
    this._sceneCanvas.height = this.canvas.height;

    const sceneCtx = this._sceneCanvas.getContext('2d');
    this._layout = Utils.getCakeLayout(this._sceneCanvas, this._cakeLayers);
    this._fullMaskCanvas = Utils.createMaskCanvas(this._sceneCanvas.width, this._sceneCanvas.height, this._layout, {
      decorations: App.state.decorations || [],
      decorationImages: this._decorationImages,
    });

    Utils.drawCakeArtwork(sceneCtx, {
      layout: this._layout,
      maskCanvas: this._fullMaskCanvas,
      creamColor: App.state.creamColor || CONFIG.creamColors[0],
      strokes: App.state.paintStrokes || [],
      creamStrokes: App.state.creamStrokes || [],
      creamStampImages: this._creamStampImages,
      decorations: App.state.decorations || [],
      decorationImages: this._decorationImages,
    });
  },

  _rememberKnifeHome() {
    this.knifeEl.dataset.homeLeft = `${this.knifeEl.offsetLeft}px`;
    this.knifeEl.dataset.homeTop = `${this.knifeEl.offsetTop}px`;
    this.knifeEl.style.left = this.knifeEl.dataset.homeLeft;
    this.knifeEl.style.top = this.knifeEl.dataset.homeTop;
  },

  _initPieces() {
    const savedSlices = Array.isArray(App.state.cutSlices) ? App.state.cutSlices : [];
    if (savedSlices.length > 0) {
      this._splitIntoFixedSlices(savedSlices);
      this._activatePlateStage();
      return;
    }

    this._pieces = [this._createPiece(this._fullMaskCanvas, 0, 0, {
      id: 'whole_cake',
      sliceIndex: -1,
      plated: false,
      plateSlot: -1,
    })];
  },

  _createPiece(maskCanvas, offsetX, offsetY, meta = {}) {
    const bounds = this._getCanvasBounds(maskCanvas);
    const artCanvas = this._maskSourceCanvas(this._sceneCanvas, maskCanvas, bounds);
    return {
      id: meta.id || `slice_${meta.sliceIndex ?? Date.now()}`,
      sliceIndex: typeof meta.sliceIndex === 'number' ? meta.sliceIndex : -1,
      canvas: artCanvas,
      maskCanvas: this._cloneCanvas(maskCanvas),
      bounds,
      offsetX,
      offsetY,
      plated: !!meta.plated,
      plateSlot: typeof meta.plateSlot === 'number' ? meta.plateSlot : -1,
      faceSrc: meta.faceSrc || null,
    };
  },

  _cloneCanvas(sourceCanvas) {
    const canvas = document.createElement('canvas');
    canvas.width = sourceCanvas.width;
    canvas.height = sourceCanvas.height;
    canvas.getContext('2d').drawImage(sourceCanvas, 0, 0);
    return canvas;
  },

  _maskSourceCanvas(sourceCanvas, maskCanvas, bounds) {
    const width = Math.max(1, bounds.width);
    const height = Math.max(1, bounds.height);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(sourceCanvas, bounds.x, bounds.y, width, height, 0, 0, width, height);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(maskCanvas, bounds.x, bounds.y, width, height, 0, 0, width, height);
    return canvas;
  },

  _draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this._pieces.forEach((piece) => {
      this.ctx.drawImage(piece.canvas, piece.bounds.x + piece.offsetX, piece.bounds.y + piece.offsetY);
    });

    if (this._cutLine.length > 1) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = 'rgba(60,40,20,0.72)';
      this.ctx.lineWidth = Math.max(3, this.canvas.width * 0.006);
      this.ctx.setLineDash([10, 6]);
      this.ctx.moveTo(this._cutLine[0].x, this._cutLine[0].y);
      for (let index = 1; index < this._cutLine.length; index += 1) {
        this.ctx.lineTo(this._cutLine[index].x, this._cutLine[index].y);
      }
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }
  },

  _requestDraw() {
    if (this._drawFrame) {
      return;
    }
    this._drawFrame = requestAnimationFrame(() => {
      this._drawFrame = 0;
      this._draw();
    });
  },

  _bindKnifeEvents() {
    const start = (event) => {
      event.preventDefault();
      this._knifeDragging = true;
      this.knifeEl.classList.add('dragging');
      this._cutLine = [];
      this._moveKnife(event);

      const point = this._getCanvasPointIfInside(event);
      if (point) {
        this._cutLine.push(point);
      }
      this._requestDraw();
    };

    const move = (event) => {
      if (!this._knifeDragging) {
        return;
      }
      event.preventDefault();
      this._moveKnife(event);
      const point = this._getCanvasPointIfInside(event);
      if (!point) {
        return;
      }
      this._cutLine.push(point);
      this._requestDraw();
    };

    const end = () => {
      if (!this._knifeDragging) {
        return;
      }
      this._knifeDragging = false;
      this.knifeEl.classList.remove('dragging');
      this._resetKnife();
      this._finalizeCut();
    };

    this.knifeEl.addEventListener('mousedown', start);
    this.knifeEl.addEventListener('touchstart', start, { passive: false });
    document.addEventListener('mousemove', move, { passive: false });
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('mouseup', end);
    document.addEventListener('touchend', end);
    document.addEventListener('touchcancel', end);

    this._cleanupFns.push(() => {
      this.knifeEl.removeEventListener('mousedown', start);
      this.knifeEl.removeEventListener('touchstart', start);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('mouseup', end);
      document.removeEventListener('touchend', end);
      document.removeEventListener('touchcancel', end);
    });
  },

  _bindPieceDragEvents() {
    const start = (event) => {
      if (this._knifeDragging || this._pieces.length <= 1) {
        return;
      }

      const point = Utils.getCanvasPos(this.canvas, event);
      const hitIndex = this._hitTestPiece(point);
      if (hitIndex < 0) {
        return;
      }

      event.preventDefault();
      this._dragIdx = hitIndex;
      this._dragStart = point;
      this._origOffset = {
        x: this._pieces[hitIndex].offsetX,
        y: this._pieces[hitIndex].offsetY,
      };

      if (this._pieces[hitIndex].plated) {
        this._pieces[hitIndex].plated = false;
        this._pieces[hitIndex].plateSlot = -1;
        this._updatePlateState();
      }
    };

    const move = (event) => {
      if (this._dragIdx < 0) {
        return;
      }
      event.preventDefault();
      const point = Utils.getCanvasPos(this.canvas, event);
      const piece = this._pieces[this._dragIdx];
      piece.offsetX = this._origOffset.x + (point.x - this._dragStart.x);
      piece.offsetY = this._origOffset.y + (point.y - this._dragStart.y);
      this._clampPieceOffset(piece);
      this._requestDraw();
    };

    const end = () => {
      if (this._dragIdx < 0) {
        return;
      }

      const piece = this._pieces[this._dragIdx];
      this._trySnapPieceToPlate(piece);
      this._dragIdx = -1;
      this._dragStart = null;
      this._origOffset = null;
      this._syncState();
      this._requestDraw();
    };

    this.canvas.addEventListener('mousedown', start);
    this.canvas.addEventListener('touchstart', start, { passive: false });
    document.addEventListener('mousemove', move, { passive: false });
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('mouseup', end);
    document.addEventListener('touchend', end);
    document.addEventListener('touchcancel', end);

    this._cleanupFns.push(() => {
      this.canvas.removeEventListener('mousedown', start);
      this.canvas.removeEventListener('touchstart', start);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('mouseup', end);
      document.removeEventListener('touchend', end);
      document.removeEventListener('touchcancel', end);
    });
  },

  _bindUiEvents() {
    this.finishBtn.onclick = () => {
      if (!this._pieces.some((piece) => piece.plated)) {
        Utils.showToast('先把切好的蛋糕拖到盘子里吧～', 1800);
        return;
      }
      this._syncState();
      setTimeout(() => {
        App.goTo('mod-ending');
      }, 500);
    };

    this._cleanupFns.push(() => {
      this.finishBtn.onclick = null;
    });
  },

  _moveKnife(event) {
    const source = event.changedTouches && event.changedTouches.length > 0
      ? event.changedTouches[0]
      : event.touches && event.touches.length > 0
        ? event.touches[0]
        : event;
    const rect = this.cutArea.getBoundingClientRect();
    const width = this.knifeEl.offsetWidth;
    const height = this.knifeEl.offsetHeight;
    const left = Utils.clamp(source.clientX - rect.left - width * 0.45, 0, rect.width - width);
    const top = Utils.clamp(source.clientY - rect.top - height * 0.55, 0, rect.height - height);
    this.knifeEl.style.left = `${left}px`;
    this.knifeEl.style.top = `${top}px`;
  },

  _resetKnife() {
    this.knifeEl.style.left = this.knifeEl.dataset.homeLeft;
    this.knifeEl.style.top = this.knifeEl.dataset.homeTop;
  },

  _getCanvasPointIfInside(event) {
    const source = event.changedTouches && event.changedTouches.length > 0
      ? event.changedTouches[0]
      : event.touches && event.touches.length > 0
        ? event.touches[0]
        : event;
    const rect = this.canvas.getBoundingClientRect();
    if (source.clientX < rect.left || source.clientX > rect.right || source.clientY < rect.top || source.clientY > rect.bottom) {
      return null;
    }
    return Utils.getCanvasPos(this.canvas, event);
  },

  _finalizeCut() {
    if (this._cutLine.length < (CONFIG.cutLineMinPoints || 3)) {
      this._cutLine = [];
      this._requestDraw();
      return;
    }

    if (this._pieces.length > 1) {
      this.hintEl.textContent = '蛋糕已按固定 8 等分切好，可以拖动任意一片装盘';
      this._cutLine = [];
      this._requestDraw();
      return;
    }

    if (!this._cutLineHitsCake()) {
      this.hintEl.textContent = '这刀没有落在蛋糕上，换个位置再试试';
      this._cutLine = [];
      this._requestDraw();
      return;
    }

    this._cutLine = [];
    this._splitIntoFixedSlices();
    this._activatePlateStage();
    this._updatePlateState();
    this._syncState();
    this.hintEl.textContent = '已经切成固定 8 等分，拖一片到盘子里吧';
    this._requestDraw();
  },

  _cutLineHitsCake() {
    const samples = this._getCutLineSamples();
    let hits = 0;
    for (const sample of samples) {
      if (this._pointInMaskCanvas(this._fullMaskCanvas, sample.x, sample.y)) {
        hits += 1;
      }
    }
    return hits >= Math.max(2, Math.ceil(samples.length * 0.08));
  },

  _getCutLineSamples() {
    if (this._cutLine.length === 0) {
      return [];
    }

    const samples = [];
    for (let index = 0; index < this._cutLine.length - 1; index += 1) {
      const start = this._cutLine[index];
      const end = this._cutLine[index + 1];
      const distance = Utils.distance(start.x, start.y, end.x, end.y);
      const steps = Math.max(1, Math.ceil(distance / 14));

      for (let step = 0; step <= steps; step += 1) {
        const progress = step / steps;
        samples.push({
          x: start.x + (end.x - start.x) * progress,
          y: start.y + (end.y - start.y) * progress,
        });
      }
    }

    if (samples.length === 0) {
      samples.push(this._cutLine[0]);
    }
    return samples;
  },

  _splitIntoFixedSlices(savedSlices = []) {
    const savedByIndex = new Map(savedSlices.map((slice) => [slice.index, slice]));
    const count = CONFIG.cutSliceCount || 8;
    const frame = this._layout.frame;
    const separation = Math.max(8, frame.width * (CONFIG.cutSliceSeparation || 0.018));

    this._pieces = [];
    for (let index = 0; index < count; index += 1) {
      const angle = this._getSliceMidAngle(index, count);
      const saved = savedByIndex.get(index) || {};
      const defaultOffsetX = Math.cos(angle) * separation;
      const defaultOffsetY = Math.sin(angle) * separation;
      const offsetX = typeof saved.offsetX === 'number'
        ? saved.offsetX
        : typeof saved.ox === 'number'
          ? saved.ox * this.canvas.width
          : defaultOffsetX;
      const offsetY = typeof saved.offsetY === 'number'
        ? saved.offsetY
        : typeof saved.oy === 'number'
          ? saved.oy * this.canvas.height
          : defaultOffsetY;
      const piece = this._createPiece(this._createSliceMask(index, count), offsetX, offsetY, {
        id: `slice_${index}`,
        sliceIndex: index,
        plated: saved.plated,
        plateSlot: saved.plateSlot,
        faceSrc: CONFIG.cutSliceFaceSrcs?.[index] || null,
      });
      this._clampPieceOffset(piece);
      this._pieces.push(piece);
    }
  },

  _getSliceMidAngle(index, count = CONFIG.cutSliceCount || 8) {
    const startAngle = -Math.PI / 2 + (index * Math.PI * 2) / count;
    return startAngle + Math.PI / count;
  },

  _createSliceMask(index, count = CONFIG.cutSliceCount || 8) {
    const canvas = document.createElement('canvas');
    canvas.width = this._fullMaskCanvas.width;
    canvas.height = this._fullMaskCanvas.height;
    const ctx = canvas.getContext('2d');
    const frame = this._layout.frame;
    const centerX = frame.x + frame.width * 0.5;
    const centerY = frame.y + frame.height * 0.5;
    const radius = Math.hypot(frame.width, frame.height) * 0.72;
    const startAngle = -Math.PI / 2 + (index * Math.PI * 2) / count;
    const endAngle = -Math.PI / 2 + ((index + 1) * Math.PI * 2) / count;

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(this._fullMaskCanvas, 0, 0);
    return canvas;
  },

  _hitTestPiece(point) {
    for (let index = this._pieces.length - 1; index >= 0; index -= 1) {
      if (this._pointInPiece(this._pieces[index], point)) {
        return index;
      }
    }
    return -1;
  },

  _pointInPiece(piece, point) {
    const x = Math.round(point.x - piece.offsetX);
    const y = Math.round(point.y - piece.offsetY);
    return this._pointInMaskCanvas(piece.maskCanvas, x, y);
  },

  _pointInMaskCanvas(maskCanvas, x, y) {
    const safeX = Math.round(x);
    const safeY = Math.round(y);
    if (safeX < 0 || safeY < 0 || safeX >= maskCanvas.width || safeY >= maskCanvas.height) {
      return false;
    }
    const alpha = maskCanvas.getContext('2d').getImageData(safeX, safeY, 1, 1).data[3];
    return alpha > 10;
  },

  _getCanvasBounds(maskCanvas) {
    const data = maskCanvas.getContext('2d').getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
    let minX = maskCanvas.width;
    let minY = maskCanvas.height;
    let maxX = 0;
    let maxY = 0;
    let found = false;

    for (let y = 0; y < maskCanvas.height; y += 1) {
      for (let x = 0; x < maskCanvas.width; x += 1) {
        const alpha = data[(y * maskCanvas.width + x) * 4 + 3];
        if (alpha <= 10) {
          continue;
        }
        found = true;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }

    if (!found) {
      return { x: 0, y: 0, width: 1, height: 1 };
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    };
  },

  _clampPieceOffset(piece) {
    const minX = -piece.bounds.x;
    const maxX = this.canvas.width - (piece.bounds.x + piece.bounds.width);
    const minY = -piece.bounds.y;
    const maxY = this.canvas.height - (piece.bounds.y + piece.bounds.height);
    piece.offsetX = Utils.clamp(piece.offsetX, minX, maxX);
    piece.offsetY = Utils.clamp(piece.offsetY, minY, maxY);
  },

  _activatePlateStage() {
    if (this._plateActive) {
      return;
    }
    this._plateActive = true;
    this.plateZone.classList.remove('hidden');
  },

  _getPieceVisualCenter(piece) {
    return {
      x: piece.bounds.x + piece.bounds.width / 2 + piece.offsetX,
      y: piece.bounds.y + piece.bounds.height / 2 + piece.offsetY,
    };
  },

  _getPlateCanvasRect() {
    const canvasRect = this.canvas.getBoundingClientRect();
    const plateRect = this.plateZone.getBoundingClientRect();
    const scaleX = this.canvas.width / canvasRect.width;
    const scaleY = this.canvas.height / canvasRect.height;
    return {
      x: (plateRect.left - canvasRect.left) * scaleX,
      y: (plateRect.top - canvasRect.top) * scaleY,
      width: plateRect.width * scaleX,
      height: plateRect.height * scaleY,
    };
  },

  _getPlateSlots() {
    const rect = this._getPlateCanvasRect();
    return [
      { x: rect.x + rect.width * 0.5, y: rect.y + rect.height * 0.52 },
      { x: rect.x + rect.width * 0.36, y: rect.y + rect.height * 0.5 },
      { x: rect.x + rect.width * 0.64, y: rect.y + rect.height * 0.5 },
      { x: rect.x + rect.width * 0.5, y: rect.y + rect.height * 0.38 },
    ];
  },

  _trySnapPieceToPlate(piece) {
    if (!this._plateActive) {
      return;
    }

    const plateRect = this._getPlateCanvasRect();
    const center = this._getPieceVisualCenter(piece);
    const inPlate = Utils.isInEllipse(
      center.x,
      center.y,
      plateRect.x + plateRect.width * 0.5,
      plateRect.y + plateRect.height * 0.54,
      plateRect.width * 0.34,
      plateRect.height * 0.18,
    );

    if (!inPlate) {
      piece.plated = false;
      piece.plateSlot = -1;
      this._updatePlateState();
      return;
    }

    const usedSlots = new Set(
      this._pieces
        .filter((item) => item.id !== piece.id && item.plated && item.plateSlot >= 0)
        .map((item) => item.plateSlot),
    );
    const slots = this._getPlateSlots();
    let slotIndex = slots.findIndex((_, index) => !usedSlots.has(index));
    if (slotIndex < 0) {
      slotIndex = 0;
    }

    const slot = slots[slotIndex];
    piece.plated = true;
    piece.plateSlot = slotIndex;
    piece.offsetX = slot.x - (piece.bounds.x + piece.bounds.width / 2);
    piece.offsetY = slot.y - (piece.bounds.y + piece.bounds.height / 2);
    this._clampPieceOffset(piece);
    this._updatePlateState();
  },

  _updatePlateState() {
    const platedCount = this._pieces.filter((piece) => piece.plated).length;
    this.finishBtn.classList.toggle('hidden', platedCount === 0);

    if (!this._plateActive) {
      this.plateZone.classList.add('hidden');
      return;
    }

    this.plateZone.classList.remove('hidden');
    if (platedCount > 0) {
      this.hintEl.textContent = '已经装盘啦，可以继续拖其它蛋糕片，也可以完成流程';
    }
  },

  _syncState() {
    if (this._pieces.length <= 1) {
      App.state.cutSlices = [];
    } else {
      App.state.cutSlices = this._pieces.map((piece) => ({
        index: piece.sliceIndex,
        ox: piece.offsetX / this.canvas.width,
        oy: piece.offsetY / this.canvas.height,
        plated: !!piece.plated,
        plateSlot: piece.plateSlot,
      }));
    }
    App.saveState();
  },

  destroy() {
    this._syncState();
    cancelAnimationFrame(this._drawFrame);
    this._drawFrame = 0;
    this._pieces = [];
    this._cutLine = [];
    this._knifeDragging = false;
    this._dragIdx = -1;
    this._dragStart = null;
    this._origOffset = null;
    this._plateActive = false;
    this.plateZone.classList.add('hidden');
    this.finishBtn.classList.add('hidden');
    this.knifeEl.classList.remove('dragging');
    this._resetKnife();
    this._cleanupFns.forEach((cleanup) => cleanup());
    this._cleanupFns = [];
  },
};
