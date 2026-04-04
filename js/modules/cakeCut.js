/**
 * 模块8: 切蛋糕互动
 * 使用真实透明蒙版按切线分离蛋糕块，并支持把切下来的蛋糕装盘
 */
const CakeCutModule = {
  _pieces: [],
  _cutLine: [],
  _knifeDragging: false,
  _sceneCanvas: null,
  _fullMaskCanvas: null,
  _cakeLayers: [],
  _decorationImages: new Map(),
  _dragIdx: -1,
  _dragStart: null,
  _origOffset: null,
  _plateActive: false,
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

    this.hintEl.textContent = '拖动蛋糕刀，在蛋糕上画出切线';
    this.knifeEl.classList.add('active');
  },

  async _loadAssets() {
    this._cakeLayers = await Utils.loadCakeLayers(App.state.cakeType || 'single');
    this._decorationImages = await Utils.loadDecorationImagesForState(App.state.decorations || []);
  },

  _resizeCanvas(canvas) {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.max(360, Math.round(rect.width * 2));
    canvas.height = Math.max(420, Math.round(rect.height * 2));
  },

  _buildSceneCanvas() {
    this._sceneCanvas = document.createElement('canvas');
    this._sceneCanvas.width = this.canvas.width;
    this._sceneCanvas.height = this.canvas.height;

    const sceneCtx = this._sceneCanvas.getContext('2d');
    const layout = Utils.getCakeLayout(this._sceneCanvas, this._cakeLayers);
    this._fullMaskCanvas = Utils.createMaskCanvas(this._sceneCanvas.width, this._sceneCanvas.height, layout, {
      decorations: App.state.decorations || [],
      decorationImages: this._decorationImages,
    });

    Utils.drawCakeArtwork(sceneCtx, {
      layout,
      maskCanvas: this._fullMaskCanvas,
      creamColor: App.state.creamColor || CONFIG.creamColors[0],
      strokes: App.state.paintStrokes || [],
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
    this._pieces = [this._createPiece(this._sceneCanvas, this._fullMaskCanvas, 0, 0)];
  },

  _createPiece(sourceCanvas, maskCanvas, offsetX, offsetY) {
    const artCanvas = this._maskSourceCanvas(sourceCanvas, maskCanvas);
    return {
      id: `piece_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      canvas: artCanvas,
      maskCanvas: this._cloneCanvas(maskCanvas),
      bounds: this._getCanvasBounds(maskCanvas),
      offsetX,
      offsetY,
      plated: false,
      plateSlot: -1,
    };
  },

  _cloneCanvas(sourceCanvas) {
    const canvas = document.createElement('canvas');
    canvas.width = sourceCanvas.width;
    canvas.height = sourceCanvas.height;
    canvas.getContext('2d').drawImage(sourceCanvas, 0, 0);
    return canvas;
  },

  _maskSourceCanvas(sourceCanvas, maskCanvas) {
    const canvas = document.createElement('canvas');
    canvas.width = sourceCanvas.width;
    canvas.height = sourceCanvas.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(sourceCanvas, 0, 0);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(maskCanvas, 0, 0);
    return canvas;
  },

  _draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this._pieces.forEach((piece) => {
      this.ctx.drawImage(piece.canvas, piece.offsetX, piece.offsetY);
    });

    if (this._cutLine.length > 1) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = 'rgba(60,40,20,0.72)';
      this.ctx.lineWidth = 4;
      this.ctx.setLineDash([10, 6]);
      this.ctx.moveTo(this._cutLine[0].x, this._cutLine[0].y);
      for (let index = 1; index < this._cutLine.length; index += 1) {
        this.ctx.lineTo(this._cutLine[index].x, this._cutLine[index].y);
      }
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }
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
      this._draw();
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
      this._draw();
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

    this._cleanupFns.push(() => {
      this.knifeEl.removeEventListener('mousedown', start);
      this.knifeEl.removeEventListener('touchstart', start);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('mouseup', end);
      document.removeEventListener('touchend', end);
    });
  },

  _bindPieceDragEvents() {
    const start = (event) => {
      if (this._knifeDragging) {
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
      this._draw();
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
      this._draw();
    };

    this.canvas.addEventListener('mousedown', start);
    this.canvas.addEventListener('touchstart', start, { passive: false });
    document.addEventListener('mousemove', move, { passive: false });
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('mouseup', end);
    document.addEventListener('touchend', end);

    this._cleanupFns.push(() => {
      this.canvas.removeEventListener('mousedown', start);
      this.canvas.removeEventListener('touchstart', start);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('mouseup', end);
      document.removeEventListener('touchend', end);
    });
  },

  _bindUiEvents() {
    this.finishBtn.onclick = () => {
      if (!this._pieces.some((piece) => piece.plated)) {
        Utils.showToast('先把切好的蛋糕拖到盘子里吧～', 1800);
        return;
      }
      setTimeout(() => {
        App.goTo('mod-ending');
      }, 900);
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
    if (x < 0 || y < 0 || x >= maskCanvas.width || y >= maskCanvas.height) {
      return false;
    }
    const alpha = maskCanvas.getContext('2d').getImageData(x, y, 1, 1).data[3];
    return alpha > 10;
  },

  _finalizeCut() {
    if (this._cutLine.length < (CONFIG.cutLineMinPoints || 3)) {
      this._cutLine = [];
      this._draw();
      return;
    }

    if (this._pieces.length >= CONFIG.maxCutPieces) {
      Utils.showToast('已经切得足够碎啦，好好享用吧～', 2000);
      this._cutLine = [];
      this._draw();
      return;
    }

    const targetIdx = this._findTargetPieceIndex();
    if (targetIdx < 0) {
      this.hintEl.textContent = '这刀没有落在蛋糕上，换个位置再试试';
      this._cutLine = [];
      this._draw();
      return;
    }

    const piece = this._pieces[targetIdx];
    const localLine = this._cutLine.map((point) => ({
      x: point.x - piece.offsetX,
      y: point.y - piece.offsetY,
    }));

    // 不再强制要求两端在蛋糕外面 — 改为只检查切线是否穿过蛋糕
    // 如果切线两端都在蛋糕内部且距离太短，提示用户
    const localStart = localLine[0];
    const localEnd = localLine[localLine.length - 1];
    const startInside = this._pointInMaskCanvas(piece.maskCanvas, localStart.x, localStart.y);
    const endInside = this._pointInMaskCanvas(piece.maskCanvas, localEnd.x, localEnd.y);
    if (startInside && endInside) {
      const dist = Utils.distance(localStart.x, localStart.y, localEnd.x, localEnd.y);
      if (dist < this.canvas.width * 0.06) {
        this.hintEl.textContent = '切线太短了，试着画得更长一些';
        this._cutLine = [];
        this._draw();
        return;
      }
    }

    const splitPieces = this._splitPiece(piece, this._cutLine);
    this._cutLine = [];

    if (!splitPieces || splitPieces.length < 2) {
      this.hintEl.textContent = '这一刀没有把蛋糕切开，试着让切线更完整一点';
      this._draw();
      return;
    }

    const remainingCapacity = CONFIG.maxCutPieces - (this._pieces.length - 1);
    const limitedPieces = splitPieces.slice(0, Math.max(2, remainingCapacity));
    this._pieces.splice(targetIdx, 1, ...limitedPieces);
    this._activatePlateStage();
    this._updatePlateState();
    this.hintEl.textContent = '继续切，或者把切好的蛋糕拖到盘子里';
    this._draw();
  },

  _findTargetPieceIndex() {
    const samples = this._getCutLineSamples();
    let bestIdx = -1;
    let bestHits = 0;
    for (let index = this._pieces.length - 1; index >= 0; index -= 1) {
      let hits = 0;
      for (const sample of samples) {
        if (this._pointInPiece(this._pieces[index], sample)) {
          hits += 1;
        }
      }

      if (hits > bestHits) {
        bestHits = hits;
        bestIdx = index;
      }
    }

    return bestHits > 0 ? bestIdx : -1;
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
      const steps = Math.max(1, Math.ceil(distance / 12));

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

  _splitPiece(piece, globalLine) {
    const localLine = globalLine.map((point) => ({
      x: point.x - piece.offsetX,
      y: point.y - piece.offsetY,
    }));

    const cutMask = this._cloneCanvas(piece.maskCanvas);
    const cutCtx = cutMask.getContext('2d');
    cutCtx.save();
    cutCtx.globalCompositeOperation = 'destination-out';
    cutCtx.strokeStyle = '#000';
    cutCtx.lineCap = 'round';
    cutCtx.lineJoin = 'round';
    cutCtx.lineWidth = Math.max(18, this.canvas.width * (CONFIG.cutLineWidth || 0.032));
    cutCtx.beginPath();
    cutCtx.moveTo(localLine[0].x, localLine[0].y);
    for (let index = 1; index < localLine.length; index += 1) {
      cutCtx.lineTo(localLine[index].x, localLine[index].y);
    }
    cutCtx.stroke();
    cutCtx.restore();

    const components = this._extractMaskComponents(cutMask).filter((component) => component.area > 180);
    if (components.length < 2) {
      return null;
    }

    const start = globalLine[0];
    const end = globalLine[globalLine.length - 1];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy) || 1;
    const normal = { x: -dy / length, y: dx / length };
    const separation = Math.max(10, this.canvas.width * 0.016);

    return components.map((component) => {
      const globalCentroid = {
        x: component.centroid.x + piece.offsetX,
        y: component.centroid.y + piece.offsetY,
      };
      const side = Math.sign(dx * (globalCentroid.y - start.y) - dy * (globalCentroid.x - start.x)) || 1;
      const nextPiece = {
        id: `piece_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
        canvas: this._maskSourceCanvas(piece.canvas, component.maskCanvas),
        maskCanvas: component.maskCanvas,
        bounds: component.bounds,
        offsetX: piece.offsetX + normal.x * separation * side,
        offsetY: piece.offsetY + normal.y * separation * side,
        plated: false,
        plateSlot: -1,
      };
      this._clampPieceOffset(nextPiece);
      return nextPiece;
    });
  },

  _extractMaskComponents(maskCanvas) {
    const width = maskCanvas.width;
    const height = maskCanvas.height;
    const sourceCtx = maskCanvas.getContext('2d');
    const imageData = sourceCtx.getImageData(0, 0, width, height).data;
    const visited = new Uint8Array(width * height);
    const components = [];

    const enqueueNeighbors = (x, y, queue) => {
      for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
        for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
          if (offsetX === 0 && offsetY === 0) {
            continue;
          }
          const nextX = x + offsetX;
          const nextY = y + offsetY;
          if (nextX < 0 || nextY < 0 || nextX >= width || nextY >= height) {
            continue;
          }
          const nextIndex = nextY * width + nextX;
          if (visited[nextIndex]) {
            continue;
          }
          if (imageData[nextIndex * 4 + 3] <= 10) {
            continue;
          }
          visited[nextIndex] = 1;
          queue.push(nextIndex);
        }
      }
    };

    for (let index = 0; index < width * height; index += 1) {
      if (visited[index] || imageData[index * 4 + 3] <= 10) {
        continue;
      }

      const queue = [index];
      const pixels = [];
      visited[index] = 1;
      let minX = width;
      let minY = height;
      let maxX = 0;
      let maxY = 0;
      let sumX = 0;
      let sumY = 0;

      while (queue.length > 0) {
        const current = queue.pop();
        const x = current % width;
        const y = (current - x) / width;
        pixels.push(current);
        sumX += x;
        sumY += y;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        enqueueNeighbors(x, y, queue);
      }

      if (pixels.length <= 120) {
        continue;
      }

      const componentCanvas = document.createElement('canvas');
      componentCanvas.width = width;
      componentCanvas.height = height;
      const componentCtx = componentCanvas.getContext('2d');
      const componentImage = componentCtx.createImageData(width, height);
      pixels.forEach((pixelIndex) => {
        componentImage.data[pixelIndex * 4 + 3] = 255;
      });
      componentCtx.putImageData(componentImage, 0, 0);

      components.push({
        maskCanvas: componentCanvas,
        area: pixels.length,
        centroid: {
          x: sumX / pixels.length,
          y: sumY / pixels.length,
        },
        bounds: {
          x: minX,
          y: minY,
          width: maxX - minX + 1,
          height: maxY - minY + 1,
        },
      });
    }

    return components.sort((left, right) => right.area - left.area);
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
      return { x: 0, y: 0, width: 0, height: 0 };
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
      this.hintEl.textContent = '已经装盘啦，可以继续切，也可以完成流程';
    }
  },

  destroy() {
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