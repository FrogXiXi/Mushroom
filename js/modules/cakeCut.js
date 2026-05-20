/**
 * 模块8: 切蛋糕互动
 * 参考纸艺蛋糕：在右侧切出一小块，拉出后露出可编辑祝福贺卡。
 */
const CakeCutModule = {
  _pieces: [],
  _cutLine: [],
  _knifeDragging: false,
  _sceneCanvas: null,
  _fullMaskCanvas: null,
  _sliceMaskCanvas: null,
  _mainMaskCanvas: null,
  _cakeLayers: [],
  _decorationImages: new Map(),
  _creamStampImages: new Map(),
  _layout: null,
  _dragIdx: -1,
  _dragStart: null,
  _origOffset: null,
  _drawFrame: 0,
  _cleanupFns: [],
  _cutComplete: false,

  async init() {
    this.canvas = document.getElementById('cut-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.cutArea = document.querySelector('.cut-area');
    this.hintEl = document.getElementById('cut-hint');
    this.knifeEl = document.getElementById('cut-knife');
    this.finishBtn = document.getElementById('plate-finish-btn');
    this.cardEl = document.getElementById('cut-card');
    this.cardInput = document.getElementById('cut-card-message');

    this._resizeCanvas(this.canvas);
    this._initCard();
    await this._loadAssets();
    this._buildSceneCanvas();
    this._rememberKnifeHome();
    this._initPieces();
    this._bindKnifeEvents();
    this._bindPieceDragEvents();
    this._bindUiEvents();
    this._draw();

    this.knifeEl.classList.add('active');
    this.hintEl.textContent = this._cutComplete
      ? '拉出右边的小蛋糕，写下祝福后就可以完成'
      : '用蛋糕刀在蛋糕右侧竖着划一刀';
  },

  _initCard() {
    const message = typeof App.state.cutCardMessage === 'string' && App.state.cutCardMessage.trim()
      ? App.state.cutCardMessage
      : '生日快乐';
    App.state.cutCardMessage = message;
    if (this.cardInput) {
      this.cardInput.value = message;
    }
    this._setCardVisible(!!App.state.cutPiecePulled || !!App.state.magicCardRevealed);
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
      creamStrokes: App.state.creamStrokes || [],
      creamStampImages: this._creamStampImages,
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
    if (App.state.cutPiecePulled || App.state.magicCardRevealed) {
      this._createPulledCake({ restored: true });
      return;
    }

    this._cutComplete = false;
    this._pieces = [this._createPiece(this._fullMaskCanvas, 0, 0, {
      id: 'whole_cake',
      role: 'whole',
      draggable: false,
    })];
    this._setCardVisible(false);
    this.finishBtn.classList.add('hidden');
  },

  _createPiece(maskCanvas, offsetX, offsetY, meta = {}) {
    const bounds = this._getCanvasBounds(maskCanvas);
    const artCanvas = this._maskSourceCanvas(this._sceneCanvas, maskCanvas, bounds);
    return {
      id: meta.id || 'cake_piece',
      role: meta.role || 'piece',
      canvas: artCanvas,
      maskCanvas: this._cloneCanvas(maskCanvas),
      bounds,
      offsetX,
      offsetY,
      draggable: !!meta.draggable,
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

    if (this._cutComplete) {
      this._drawCutSeam();
    }

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

  _drawCutSeam() {
    const frame = this._layout.frame;
    const seamX = this._getSliceCutX();
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(123, 73, 60, 0.38)';
    this.ctx.lineWidth = Math.max(2, frame.width * 0.01);
    this.ctx.beginPath();
    this.ctx.moveTo(seamX, frame.y + frame.height * 0.08);
    this.ctx.bezierCurveTo(
      seamX + frame.width * 0.015,
      frame.y + frame.height * 0.34,
      seamX - frame.width * 0.01,
      frame.y + frame.height * 0.68,
      seamX + frame.width * 0.012,
      frame.y + frame.height * 0.94,
    );
    this.ctx.stroke();
    this.ctx.restore();
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
      if (this._cutComplete) {
        return;
      }
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
      if (this._knifeDragging || !this._cutComplete) {
        return;
      }

      const point = Utils.getCanvasPos(this.canvas, event);
      const hitIndex = this._hitTestPiece(point);
      if (hitIndex < 0 || !this._pieces[hitIndex].draggable) {
        return;
      }

      event.preventDefault();
      this._dragIdx = hitIndex;
      this._dragStart = point;
      this._origOffset = {
        x: this._pieces[hitIndex].offsetX,
        y: this._pieces[hitIndex].offsetY,
      };
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
      if (!this._cutComplete) {
        Utils.showToast('先切出右边的小蛋糕吧', 1600);
        return;
      }
      this._syncState();
      setTimeout(() => {
        App.goTo('mod-ending');
      }, 400);
    };

    const onCardInput = () => {
      App.state.cutCardMessage = this.cardInput.value.trim() || '生日快乐';
      App.saveState();
    };
    this.cardInput.addEventListener('input', onCardInput);

    this._cleanupFns.push(() => {
      this.finishBtn.onclick = null;
      this.cardInput.removeEventListener('input', onCardInput);
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

    if (!this._cutLineHitsRightCutZone()) {
      this.hintEl.textContent = '请在蛋糕右侧竖着切一刀';
      this._cutLine = [];
      this._requestDraw();
      return;
    }

    this._cutLine = [];
    this._createPulledCake();
    this._syncState();
    this.hintEl.textContent = '拉出右边的小蛋糕，在贺卡上写下祝福';
    this._requestDraw();
  },

  _cutLineHitsRightCutZone() {
    const samples = this._getCutLineSamples();
    const frame = this._layout.frame;
    const minX = frame.x + frame.width * 0.58;
    const maxX = frame.x + frame.width * 1.04;
    let hits = 0;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const sample of samples) {
      if (sample.x < minX || sample.x > maxX) {
        continue;
      }
      if (!this._pointInMaskCanvas(this._fullMaskCanvas, sample.x, sample.y)) {
        continue;
      }
      hits += 1;
      minY = Math.min(minY, sample.y);
      maxY = Math.max(maxY, sample.y);
    }

    return hits >= Math.max(2, Math.ceil(samples.length * 0.08))
      && maxY - minY >= frame.height * 0.18;
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

  _createPulledCake({ restored = false } = {}) {
    this._cutComplete = true;
    this._sliceMaskCanvas = this._createRightSliceMask();
    this._mainMaskCanvas = this._createMainCakeMask(this._sliceMaskCanvas);
    const frame = this._layout.frame;
    const defaultOffset = {
      x: frame.width * (restored ? 0.16 : 0.11),
      y: frame.height * 0.012,
    };

    this._pieces = [
      this._createPiece(this._mainMaskCanvas, 0, 0, {
        id: 'main_cake',
        role: 'main',
        draggable: false,
      }),
      this._createPiece(this._sliceMaskCanvas, defaultOffset.x, defaultOffset.y, {
        id: 'pull_slice',
        role: 'slice',
        draggable: true,
      }),
    ];

    this._clampPieceOffset(this._pieces[1]);
    this._setCardVisible(true);
    this.finishBtn.classList.remove('hidden');
    App.state.cutPiecePulled = true;
    App.state.magicCardRevealed = true;
    App.state.cutSlices = [];
  },

  _getSliceCutX() {
    return this._layout.frame.x + this._layout.frame.width * 0.72;
  },

  _createRightSliceMask() {
    const canvas = document.createElement('canvas');
    canvas.width = this._fullMaskCanvas.width;
    canvas.height = this._fullMaskCanvas.height;
    const ctx = canvas.getContext('2d');
    const frame = this._layout.frame;
    const cutX = this._getSliceCutX();
    const rightX = frame.x + frame.width * 1.08;

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(cutX, frame.y - frame.height * 0.08);
    ctx.lineTo(rightX, frame.y - frame.height * 0.02);
    ctx.lineTo(rightX, frame.y + frame.height * 1.08);
    ctx.lineTo(cutX - frame.width * 0.012, frame.y + frame.height * 1.02);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(this._fullMaskCanvas, 0, 0);
    return canvas;
  },

  _createMainCakeMask(sliceMaskCanvas) {
    const canvas = document.createElement('canvas');
    canvas.width = this._fullMaskCanvas.width;
    canvas.height = this._fullMaskCanvas.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this._fullMaskCanvas, 0, 0);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(sliceMaskCanvas, 0, 0);
    return canvas;
  },

  _hitTestPiece(point) {
    for (let index = this._pieces.length - 1; index >= 0; index -= 1) {
      if (!this._pieces[index].draggable) {
        continue;
      }
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
    const maxX = this.canvas.width - (piece.bounds.x + piece.bounds.width * 0.42);
    const minY = -piece.bounds.y;
    const maxY = this.canvas.height - (piece.bounds.y + piece.bounds.height);
    piece.offsetX = Utils.clamp(piece.offsetX, minX, maxX);
    piece.offsetY = Utils.clamp(piece.offsetY, minY, maxY);
  },

  _setCardVisible(visible) {
    if (!this.cardEl) {
      return;
    }
    this.cardEl.classList.toggle('hidden', !visible);
    this.cardEl.setAttribute('aria-hidden', visible ? 'false' : 'true');
  },

  _syncState() {
    App.state.cutCardMessage = this.cardInput?.value.trim() || '生日快乐';
    App.state.cutPiecePulled = this._cutComplete;
    App.state.magicCardRevealed = this._cutComplete;
    App.state.cutSlices = [];
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
    this._cutComplete = false;
    this._setCardVisible(false);
    this.finishBtn.classList.add('hidden');
    this.knifeEl.classList.remove('dragging');
    this._resetKnife();
    this._cleanupFns.forEach((cleanup) => cleanup());
    this._cleanupFns = [];
  },
};
