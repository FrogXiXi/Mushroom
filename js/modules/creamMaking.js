/**
 * 模块3: 奶油制作
 * 交互顺序：打鸡蛋 -> 打发奶油 -> 滴入色素 -> 给蛋糕抹面
 */
const CreamMakingModule = {
  step: 'egg',
  whipProgress: 0,
  coverProgress: 0,
  _images: null,
  _cakeLayers: [],
  _targetCakeLayers: [],
  _applyLayout: null,
  _applyTargetLayout: null,
  _applyMaskCanvas: null,
  _coverageCanvas: null,
  _coverageCtx: null,
  _coverageMaskData: null,
  _maskPixelCount: 0,
  _cleanupFns: [],
  _draggingEgg: false,
  _draggingMixer: false,
  _draggingSpatula: false,
  _lastAngle: null,
  _totalAngle: 0,
  _lastSpatulaPoint: null,
  _animationFrame: null,
  _eggAdded: false,
  _colorMixed: false,
  _bottleDrag: null,
  _bottleGhost: null,

  async init() {
    this._cacheDom();
    this._resetState();
    this._resizeCanvas();
    this._resizeApplyCanvas();
    this._setLoadingState(true);

    try {
      const preloadPaths = [
        'making/ingredients/eggs/whole',
        'making/ingredients/eggs/cracked_left',
        'making/ingredients/eggs/cracked_right',
        'making/ingredients/eggs/yolk',
        'making/containers/bowl/bowl',
        'making/tools/mixer/mixer',
        'making/tools/spatula/spatula',
        ...CONFIG.creamColors.map((item) => item.src),
      ];

      const [images, cakeLayers] = await Promise.all([
        Utils.preloadImages(preloadPaths),
        Utils.loadCakeLayers(App.state.cakeType || 'single', { coated: false }),
      ]);

      this._images = images;
      this._cakeLayers = cakeLayers;

      this._rememberHomePositions();
      this._setupApplyPreview();
      this._setupBottlePicker();
      this._bindEggDrag();
      this._bindMixerDrag();
      this._bindSpatulaDrag();
      this._renderLiquid();
      this._renderApplyPreview();
      this._updateProgress();
      this._updateCoverProgress();
      this._setHint('把左边的鸡蛋拖到碗里');
      this._setMixerActive(false);
      this._clearCanvas();
    } finally {
      this._setLoadingState(false);
    }
  },

  _cacheDom() {
    this.moduleEl = document.getElementById('mod-cream-making');
    this.area = document.querySelector('.cream-making-area');
    this.canvas = document.getElementById('cream-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.eggTool = document.getElementById('egg-tool');
    this.mixerTool = document.getElementById('mixer-tool');
    this.bowlArea = document.getElementById('cream-bowl-area');
    this.liquid = document.getElementById('cream-liquid');
    this.picker = document.getElementById('color-picker');
    this.progressWrap = document.getElementById('cream-progress');
    this.nextBtn = document.getElementById('cream-making-next');
    this.progressFill = document.querySelector('#cream-progress .cream-progress-fill');
    this.progressText = document.querySelector('#cream-progress .cream-progress-text');
    this.applyStage = document.getElementById('cream-apply-stage');
    this.applyPreview = document.getElementById('cream-apply-preview');
    this.applyCanvas = document.getElementById('cream-apply-canvas');
    this.applyCtx = this.applyCanvas.getContext('2d');
    this.spatulaTool = document.getElementById('spatula-tool');
    this.coverFill = document.getElementById('cream-cover-fill');
    this.coverText = document.getElementById('cream-cover-text');
  },

  _resetState() {
    this.step = 'egg';
    this.whipProgress = 0;
    this.coverProgress = 0;
    this._draggingEgg = false;
    this._draggingMixer = false;
    this._draggingSpatula = false;
    this._lastAngle = null;
    this._totalAngle = 0;
    this._lastSpatulaPoint = null;
    this._eggAdded = false;
    this._colorMixed = false;
    this._targetCakeLayers = [];
    this._bottleDrag = null;
    this._destroyBottleGhost();
    App.state.creamColor = App.state.creamColor || CONFIG.creamColors[0];
    App.saveState();

    this.nextBtn.classList.add('hidden');
    this.nextBtn.onclick = null;
    this.eggTool.style.visibility = 'visible';
    this._setStageLayout('egg');
    this.spatulaTool.classList.add('hidden');
    this.spatulaTool.classList.remove('dragging');
  },

  _setLoadingState(loading) {
    if (!this.moduleEl) {
      return;
    }
    this.moduleEl.classList.toggle('is-loading', !!loading);
  },

  _resizeCanvas() {
    const rect = this.area.getBoundingClientRect();
    this.canvas.width = Math.max(320, Math.round(rect.width * 2));
    this.canvas.height = Math.max(240, Math.round(rect.height * 2));
  },

  _resizeApplyCanvas() {
    const rect = this.applyPreview.getBoundingClientRect();
    const width = rect.width || 260;
    const height = rect.height || 180;
    this.applyCanvas.width = Math.max(360, Math.round(width * 2));
    this.applyCanvas.height = Math.max(220, Math.round(height * 2));
  },

  _rememberHomePositions() {
    [this.eggTool, this.mixerTool].forEach((element) => {
      element.dataset.homeLeft = `${element.offsetLeft}px`;
      element.dataset.homeTop = `${element.offsetTop}px`;
      element.style.left = element.dataset.homeLeft;
      element.style.top = element.dataset.homeTop;
    });
  },

  _rememberSpatulaHome() {
    this.spatulaTool.dataset.homeLeft = `${this.spatulaTool.offsetLeft}px`;
    this.spatulaTool.dataset.homeTop = `${this.spatulaTool.offsetTop}px`;
    this.spatulaTool.style.left = this.spatulaTool.dataset.homeLeft;
    this.spatulaTool.style.top = this.spatulaTool.dataset.homeTop;
  },

  _setupApplyPreview() {
    this._applyLayout = Utils.getCakeLayout(this.applyCanvas, this._cakeLayers);
    this._applyTargetLayout = Utils.getCakeLayout(
      this.applyCanvas,
      this._targetCakeLayers.length > 0 ? this._targetCakeLayers : this._cakeLayers,
    );
    this._applyMaskCanvas = Utils.createMaskCanvas(this.applyCanvas.width, this.applyCanvas.height, this._applyLayout);
    this._coverageCanvas = document.createElement('canvas');
    this._coverageCanvas.width = this.applyCanvas.width;
    this._coverageCanvas.height = this.applyCanvas.height;
    this._coverageCtx = this._coverageCanvas.getContext('2d');

    const maskData = this._applyMaskCanvas.getContext('2d').getImageData(0, 0, this.applyCanvas.width, this.applyCanvas.height).data;
    this._coverageMaskData = maskData;
    this._maskPixelCount = 0;
    for (let index = 3; index < maskData.length; index += 4) {
      if (maskData[index] > 12) {
        this._maskPixelCount += 1;
      }
    }
  },

  async _loadTargetCakeLayers(color) {
    this._targetCakeLayers = await Utils.loadCakeLayers(App.state.cakeType || 'single', {
      creamColor: color || App.state.creamColor || CONFIG.creamColors[0],
    });
    if (this.applyCanvas) {
      this._applyTargetLayout = Utils.getCakeLayout(this.applyCanvas, this._targetCakeLayers);
    }
  },

  _setupBottlePicker() {
    this.picker.innerHTML = '';
    CONFIG.creamColors.forEach((color, index) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.setAttribute('aria-label', color.name);
      const activeId = App.state.creamColor?.id || CONFIG.creamColors[0].id;
      option.className = `bottle-option${activeId === color.id || (!activeId && index === 0) ? ' active' : ''}`;
      option.innerHTML = `
        <span class="bottle-option-thumb">
          <img src="${CONFIG.imgBase + color.src}.webp" alt="${color.name}" draggable="false">
        </span>
      `;

      const image = option.querySelector('img');
      image.onerror = function onBottleError() {
        this.src = `${CONFIG.imgBase + color.src}.png`;
      };

      this._bindBottleInteraction(option, color);
      this.picker.appendChild(option);
    });
  },

  _bindBottleInteraction(option, color) {
    if (this._isTouchBottleMode()) {
      const tapSelect = async (event) => {
        event.preventDefault();

        if (this.step === 'egg' || this.step === 'egg-anim') {
          Utils.showToast('先把鸡蛋打进碗里哦～', 1200);
          return;
        }
        if (this.step === 'drop-color') {
          return;
        }
        if (this.step !== 'color') {
          Utils.showToast('这一阶段不用再倒色素啦～', 1200);
          return;
        }

        this.picker.querySelectorAll('.bottle-option').forEach((item) => item.classList.remove('active'));
        option.classList.add('active');
        App.state.creamColor = color;
        App.saveState();
        await this._loadTargetCakeLayers(color);
        this._playColorDrop(color);
      };

      option.addEventListener('click', tapSelect);
      this._cleanupFns.push(() => {
        option.removeEventListener('click', tapSelect);
      });
      return;
    }

    const usePointer = typeof window !== 'undefined' && 'PointerEvent' in window;

    const start = (event) => {
      if (event.button != null && event.button !== 0) {
        return;
      }

      if (this.step === 'egg' || this.step === 'egg-anim') {
        Utils.showToast('先把鸡蛋打进碗里哦～', 1200);
        return;
      }
      if (this.step === 'drop-color') {
        return;
      }
      if (this.step !== 'color') {
        Utils.showToast('这一阶段不用再倒色素啦～', 1200);
        return;
      }

      event.preventDefault();
      option.classList.add('dragging');
      this._bottleDrag = { color, option };
      this._createBottleGhost(color, event);
    };

    const move = (event) => {
      if (!this._bottleDrag) {
        return;
      }
      event.preventDefault();
      this._moveBottleGhost(event);
    };

    const end = async (event) => {
      if (!this._bottleDrag) {
        return;
      }

      const { color: activeColor, option: activeOption } = this._bottleDrag;
      activeOption.classList.remove('dragging');
      this._destroyBottleGhost();
      this._bottleDrag = null;

      const point = this._getAreaPoint(event);
      if (this.step !== 'color' || !this._isPointInBowl(point)) {
        return;
      }

      this.picker.querySelectorAll('.bottle-option').forEach((item) => item.classList.remove('active'));
      activeOption.classList.add('active');
      App.state.creamColor = activeColor;
      App.saveState();
      await this._loadTargetCakeLayers(activeColor);
      this._playColorDrop(activeColor);
    };

    if (usePointer) {
      option.addEventListener('pointerdown', start, { passive: false });
      document.addEventListener('pointermove', move, { passive: false });
      document.addEventListener('pointerup', end);
      document.addEventListener('pointercancel', end);

      this._cleanupFns.push(() => {
        option.removeEventListener('pointerdown', start);
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', end);
        document.removeEventListener('pointercancel', end);
      });
      return;
    }

    option.addEventListener('mousedown', start);
    option.addEventListener('touchstart', start, { passive: false });
    document.addEventListener('mousemove', move, { passive: false });
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('mouseup', end);
    document.addEventListener('touchend', end);

    this._cleanupFns.push(() => {
      option.removeEventListener('mousedown', start);
      option.removeEventListener('touchstart', start);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('mouseup', end);
      document.removeEventListener('touchend', end);
    });
  },

  _isTouchBottleMode() {
    if (typeof window === 'undefined') {
      return false;
    }

    const coarsePointer = typeof window.matchMedia === 'function'
      ? window.matchMedia('(pointer: coarse)').matches
      : false;
    const touchPoints = typeof navigator !== 'undefined'
      ? navigator.maxTouchPoints || 0
      : 0;
    return coarsePointer || touchPoints > 0;
  },

  _getBottleHintText() {
    return this._isTouchBottleMode()
      ? '奶油已经打发好，点一下色素瓶给奶油上色'
      : '奶油已经打发好，把一个色素瓶拖进碗里给奶油上色';
  },

  _setBottlePickerEnabled(enabled) {
    this.picker.classList.toggle('is-disabled', !enabled);
  },

  _showNextButton(text, onClick) {
    this.nextBtn.textContent = text;
    this.nextBtn.classList.remove('hidden');
    this.nextBtn.onclick = onClick;
  },

  _hideNextButton() {
    this.nextBtn.classList.add('hidden');
    this.nextBtn.onclick = null;
  },

  _createBottleGhost(color, event) {
    this._destroyBottleGhost();
    const ghost = document.createElement('div');
    ghost.className = 'bottle-drag-ghost';
    ghost.innerHTML = `<img src="${CONFIG.imgBase + color.src}.webp" alt="${color.name}">`;
    ghost.querySelector('img').onerror = function onGhostError() {
      this.src = `${CONFIG.imgBase + color.src}.png`;
    };
    document.body.appendChild(ghost);
    this._bottleGhost = ghost;
    this._moveBottleGhost(event);
  },

  _moveBottleGhost(event) {
    if (!this._bottleGhost) {
      return;
    }

    const source = event.changedTouches && event.changedTouches.length > 0
      ? event.changedTouches[0]
      : event.touches && event.touches.length > 0
        ? event.touches[0]
        : event;
    this._bottleGhost.style.left = `${source.clientX}px`;
    this._bottleGhost.style.top = `${source.clientY}px`;
  },

  _destroyBottleGhost() {
    if (this._bottleGhost) {
      this._bottleGhost.remove();
      this._bottleGhost = null;
    }
  },

  _bindEggDrag() {
    const usePointer = typeof window !== 'undefined' && 'PointerEvent' in window;
    const start = (event) => {
      if (this.step !== 'egg') {
        return;
      }
      if (event.button != null && event.button !== 0) {
        return;
      }
      event.preventDefault();
      this._draggingEgg = true;
      this.eggTool.classList.add('dragging');
    };

    const move = (event) => {
      if (!this._draggingEgg) {
        return;
      }
      event.preventDefault();
      const point = this._getAreaPoint(event);
      this._placeTool(this.eggTool, point.x - this.eggTool.offsetWidth / 2, point.y - this.eggTool.offsetHeight / 2);
    };

    const end = (event) => {
      if (!this._draggingEgg) {
        return;
      }
      this._draggingEgg = false;
      this.eggTool.classList.remove('dragging');
      const point = this._getAreaPoint(event);
      if (this._isPointInBowl(point)) {
        this._playEggCrackAnimation();
      } else {
        this._resetTool(this.eggTool);
      }
    };

    if (usePointer) {
      this.eggTool.addEventListener('pointerdown', start, { passive: false });
      document.addEventListener('pointermove', move, { passive: false });
      document.addEventListener('pointerup', end);
      document.addEventListener('pointercancel', end);

      this._cleanupFns.push(() => {
        this.eggTool.removeEventListener('pointerdown', start);
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', end);
        document.removeEventListener('pointercancel', end);
      });
      return;
    }

    this.eggTool.addEventListener('mousedown', start);
    this.eggTool.addEventListener('touchstart', start, { passive: false });
    document.addEventListener('mousemove', move, { passive: false });
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('mouseup', end);
    document.addEventListener('touchend', end);

    this._cleanupFns.push(() => {
      this.eggTool.removeEventListener('mousedown', start);
      this.eggTool.removeEventListener('touchstart', start);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('mouseup', end);
      document.removeEventListener('touchend', end);
    });
  },

  _bindMixerDrag() {
    const usePointer = typeof window !== 'undefined' && 'PointerEvent' in window;
    const start = (event) => {
      if (this.step !== 'whip') {
        return;
      }
      if (event.button != null && event.button !== 0) {
        return;
      }
      event.preventDefault();
      this._draggingMixer = true;
      this.mixerTool.classList.add('dragging');
    };

    const move = (event) => {
      if (!this._draggingMixer || this.step !== 'whip') {
        return;
      }
      event.preventDefault();
      const point = this._getAreaPoint(event);
      this._placeTool(this.mixerTool, point.x - this.mixerTool.offsetWidth / 2, point.y - this.mixerTool.offsetHeight / 2);

      const tipPoint = this._getMixerTipPoint();
      if (!this._isPointInBowl(tipPoint)) {
        this._lastAngle = null;
        return;
      }

      const angle = this._getBowlAngle(tipPoint);
      if (this._lastAngle == null) {
        this._lastAngle = angle;
        return;
      }

      let delta = angle - this._lastAngle;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      this._totalAngle += Math.abs(delta);
      this._lastAngle = angle;

      const rounds = this._totalAngle / (Math.PI * 2);
      this.whipProgress = Math.min(100, (rounds / CONFIG.whipRounds) * 100);
      this._updateProgress();
      this._renderLiquid();

      if (this.whipProgress >= 100) {
        this._draggingMixer = false;
        this.mixerTool.classList.remove('dragging');
        this._resetTool(this.mixerTool);
        this._onWhipDone();
      }
    };

    const end = () => {
      if (!this._draggingMixer) {
        return;
      }
      this._draggingMixer = false;
      this._lastAngle = null;
      this.mixerTool.classList.remove('dragging');
      this._resetTool(this.mixerTool);
    };

    if (usePointer) {
      this.mixerTool.addEventListener('pointerdown', start, { passive: false });
      document.addEventListener('pointermove', move, { passive: false });
      document.addEventListener('pointerup', end);
      document.addEventListener('pointercancel', end);

      this._cleanupFns.push(() => {
        this.mixerTool.removeEventListener('pointerdown', start);
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', end);
        document.removeEventListener('pointercancel', end);
      });
      return;
    }

    this.mixerTool.addEventListener('mousedown', start);
    this.mixerTool.addEventListener('touchstart', start, { passive: false });
    document.addEventListener('mousemove', move, { passive: false });
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('mouseup', end);
    document.addEventListener('touchend', end);

    this._cleanupFns.push(() => {
      this.mixerTool.removeEventListener('mousedown', start);
      this.mixerTool.removeEventListener('touchstart', start);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('mouseup', end);
      document.removeEventListener('touchend', end);
    });
  },

  _bindSpatulaDrag() {
    const usePointer = typeof window !== 'undefined' && 'PointerEvent' in window;
    const start = (event) => {
      if (this.step !== 'coat') {
        return;
      }
      if (event.button != null && event.button !== 0) {
        return;
      }
      event.preventDefault();
      this._draggingSpatula = true;
      this.spatulaTool.classList.add('dragging');
      const previewPoint = this._getPreviewPoint(event);
      this._placeSpatulaInPreview(previewPoint);
      this._lastSpatulaPoint = this._getSpatulaPaintPoint();
    };

    const move = (event) => {
      if (!this._draggingSpatula || this.step !== 'coat') {
        return;
      }
      event.preventDefault();
      const previewPoint = this._getPreviewPoint(event);
      this._placeSpatulaInPreview(previewPoint);

      const canvasPoint = this._getSpatulaPaintPoint();
      if (!Utils.pointInMask(this._applyMaskCanvas, canvasPoint.x, canvasPoint.y)) {
        this._lastSpatulaPoint = canvasPoint;
        return;
      }

      this._paintCoverage(this._lastSpatulaPoint || canvasPoint, canvasPoint);
      this._lastSpatulaPoint = canvasPoint;
      this._renderApplyPreview();
      this._refreshCoverageProgress();
    };

    const end = () => {
      if (!this._draggingSpatula) {
        return;
      }
      this._draggingSpatula = false;
      this._lastSpatulaPoint = null;
      this.spatulaTool.classList.remove('dragging');
      this._resetTool(this.spatulaTool);
    };

    if (usePointer) {
      this.spatulaTool.addEventListener('pointerdown', start, { passive: false });
      document.addEventListener('pointermove', move, { passive: false });
      document.addEventListener('pointerup', end);
      document.addEventListener('pointercancel', end);

      this._cleanupFns.push(() => {
        this.spatulaTool.removeEventListener('pointerdown', start);
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', end);
        document.removeEventListener('pointercancel', end);
      });
      return;
    }

    this.spatulaTool.addEventListener('mousedown', start);
    this.spatulaTool.addEventListener('touchstart', start, { passive: false });
    document.addEventListener('mousemove', move, { passive: false });
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('mouseup', end);
    document.addEventListener('touchend', end);

    this._cleanupFns.push(() => {
      this.spatulaTool.removeEventListener('mousedown', start);
      this.spatulaTool.removeEventListener('touchstart', start);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('mouseup', end);
      document.removeEventListener('touchend', end);
    });
  },

  _playEggCrackAnimation() {
    this.step = 'egg-anim';
    this._setHint('鸡蛋正在打进碗里');
    this.eggTool.style.visibility = 'hidden';

    let frame = 0;
    const totalFrames = 42;
    const bowl = this._getBowlMetrics();

    const animate = () => {
      this._clearCanvas();
      const progress = frame / totalFrames;
      const eggSize = this.canvas.width * 0.12;
      const dropY = bowl.top - bowl.height * 0.38 + bowl.height * 0.72 * progress;

      if (progress < 0.56) {
        this._drawWholeEgg(bowl.cx, dropY, eggSize);
      } else {
        this._drawCrackedEgg(bowl.cx, dropY, eggSize, (progress - 0.56) / 0.44);
      }

      if (frame < totalFrames) {
        frame += 1;
        this._animationFrame = requestAnimationFrame(animate);
      } else {
        this._clearCanvas();
        this._eggAdded = true;
        this._colorMixed = false;
        this._renderLiquid();
        this.step = 'whip';
        this._setStageLayout('whip');
        this._setMixerActive(true);
        this._setHint('拖动搅拌器，在碗里连续画圈，把蛋液打发成奶油');
      }
    };

    animate();
  },

  _playColorDrop(color) {
    if (this.step !== 'color') {
      return;
    }

    const targetLayersPromise = this._loadTargetCakeLayers(color);
    this.step = 'drop-color';
    this._setStageLayout('drop-color');
    this._totalAngle = 0;
    this._lastAngle = null;
    this._eggAdded = true;
    this._colorMixed = false;
    this._setMixerActive(false);
    this._setHint('把色素滴进奶油里，让颜色慢慢晕开');

    let progress = 0;
    const bowl = this._getBowlMetrics();
    const animate = () => {
      progress += 0.018;
      this._clearCanvas();

      const radius = this.canvas.width * 0.014;
      const startY = bowl.top - bowl.height * 0.44;
      const targetY = bowl.cy - bowl.height * 0.18;
      const currentY = startY + (targetY - startY) * Math.min(progress, 1);

      this.ctx.fillStyle = color.hex;
      this.ctx.beginPath();
      this.ctx.arc(bowl.cx - radius * 2.6, currentY, radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(bowl.cx + radius * 2.4, currentY + bowl.height * 0.08, radius, 0, Math.PI * 2);
      this.ctx.fill();

      const mixFactor = Utils.clamp((progress - 0.46) / 0.54, 0, 1);
      this._renderLiquid(color, mixFactor);

      if (progress < 1) {
        this._animationFrame = requestAnimationFrame(animate);
      } else {
        this._clearCanvas();
        this._colorMixed = true;
        this._renderLiquid(color, 1);
        targetLayersPromise.then(() => {
          this._onColorDone();
        });
      }
    };

    animate();
  },

  _drawWholeEgg(centerX, centerY, size) {
    const image = this._images.get('making/ingredients/eggs/whole');
    if (image) {
      const width = size;
      const height = width * (image.height / image.width);
      this.ctx.drawImage(image, centerX - width / 2, centerY - height / 2, width, height);
      return;
    }

    this.ctx.fillStyle = '#fff7eb';
    this.ctx.beginPath();
    this.ctx.ellipse(centerX, centerY, size * 0.28, size * 0.4, 0, 0, Math.PI * 2);
    this.ctx.fill();
  },

  _drawCrackedEgg(centerX, centerY, size, split) {
    const left = this._images.get('making/ingredients/eggs/cracked_left');
    const right = this._images.get('making/ingredients/eggs/cracked_right');
    const yolk = this._images.get('making/ingredients/eggs/yolk');
    const offset = size * 0.28 * split;
    const lift = size * 0.12 * split;
    const halfWidth = size * 0.52;

    if (left) {
      const height = halfWidth * (left.height / left.width);
      this.ctx.drawImage(left, centerX - offset - halfWidth / 2, centerY - lift - height / 2, halfWidth, height);
    }
    if (right) {
      const height = halfWidth * (right.height / right.width);
      this.ctx.drawImage(right, centerX + offset - halfWidth / 2, centerY - lift - height / 2, halfWidth, height);
    }
    if (yolk) {
      const yolkWidth = size * 0.34;
      const yolkHeight = yolkWidth * (yolk.height / yolk.width);
      this.ctx.drawImage(yolk, centerX - yolkWidth / 2, centerY + size * 0.1 * split, yolkWidth, yolkHeight);
    }
  },

  _renderLiquid(color = App.state.creamColor, mixFactor = this._colorMixed ? 1 : 0) {
    if (!this._eggAdded) {
      this.liquid.style.opacity = '0';
      this.liquid.style.transform = 'scale(0.94)';
      this.liquid.style.boxShadow = 'none';
      this.liquid.style.filter = 'none';
      return;
    }

    const active = color || CONFIG.creamColors[0];
    const safeMix = Utils.clamp(mixFactor, 0, 1);
    const whipFactor = Utils.clamp(this.whipProgress / 100, 0, 1);

    if (!this._colorMixed && safeMix <= 0) {
      if (whipFactor > 0.04) {
        const creamStrength = Utils.clamp(whipFactor, 0, 1);
        this.liquid.style.background = `radial-gradient(circle at 48% 34%, rgba(255,255,255,${0.32 + creamStrength * 0.24}), rgba(255,250,242,${0.9}) 36%, rgba(247,236,220,${0.92}) 68%, rgba(233,218,196,0.95) 100%)`;
        this.liquid.style.opacity = `${0.76 + creamStrength * 0.18}`;
        this.liquid.style.boxShadow = `inset 0 ${10 + creamStrength * 16}px ${18 + creamStrength * 20}px rgba(255,255,255,${0.18 + creamStrength * 0.18})`;
        this.liquid.style.transform = `scale(${0.98 + creamStrength * 0.16})`;
        this.liquid.style.filter = `saturate(${0.82 + creamStrength * 0.08}) brightness(${1 + creamStrength * 0.08})`;
        return;
      }

      this.liquid.style.background = 'radial-gradient(circle at 50% 42%, rgba(255,223,120,0.98), rgba(255,191,92,0.96) 58%, rgba(242,155,70,0.92) 100%)';
      this.liquid.style.opacity = '0.92';
      this.liquid.style.boxShadow = 'inset 0 12px 20px rgba(255,245,214,0.28)';
      this.liquid.style.transform = 'scale(0.98)';
      this.liquid.style.filter = 'saturate(1.02)';
      return;
    }

    const topHighlight = Utils.hexToRgba(active.hex, 0.78 + safeMix * 0.1);
    const midTone = Utils.hexToRgba(active.hex, 0.86 + safeMix * 0.08);
    const bottomTone = Utils.hexToRgba(active.hex, 0.9 + safeMix * 0.05);
    this.liquid.style.background = `radial-gradient(circle at 48% 34%, rgba(255,255,255,${0.24 + safeMix * 0.18}), ${topHighlight} 42%, ${midTone} 68%, ${bottomTone} 100%)`;
    this.liquid.style.opacity = `${0.7 + safeMix * 0.18 + whipFactor * 0.08}`;
    this.liquid.style.boxShadow = `inset 0 ${8 + whipFactor * 12}px ${18 + whipFactor * 14}px rgba(255,255,255,${0.14 + safeMix * 0.16 + whipFactor * 0.08})`;
    this.liquid.style.transform = `scale(${0.99 + safeMix * 0.03 + whipFactor * 0.12})`;
    this.liquid.style.filter = `saturate(${1 + safeMix * 0.16}) brightness(${1 + whipFactor * 0.04})`;
  },

  _renderApplyPreview() {
    this.applyCtx.clearRect(0, 0, this.applyCanvas.width, this.applyCanvas.height);
    Utils.drawCakeLayers(this.applyCtx, this._applyLayout);

    if (this._targetCakeLayers.length === 0) {
      return;
    }

    Utils.renderMaskedLayer(this.applyCtx, this._applyMaskCanvas, (layerCtx) => {
      Utils.drawCakeLayers(layerCtx, this._applyTargetLayout || this._applyLayout);
      layerCtx.globalCompositeOperation = 'destination-in';
      layerCtx.drawImage(this._coverageCanvas, 0, 0);
    });
  },

  _updateProgress() {
    this.progressFill.style.width = `${Math.round(this.whipProgress)}%`;
    this.progressText.textContent = `打发进度: ${Math.round(this.whipProgress)}%`;
  },

  _updateCoverProgress() {
    this.coverFill.style.width = `${Math.round(this.coverProgress)}%`;
    this.coverText.textContent = `抹面进度: ${Math.round(this.coverProgress)}%`;
  },

  _refreshCoverageProgress() {
    const coverageData = this._coverageCtx.getImageData(0, 0, this._coverageCanvas.width, this._coverageCanvas.height).data;
    let coveredPixels = 0;

    for (let index = 3; index < coverageData.length; index += 4) {
      if (this._coverageMaskData[index] > 12 && coverageData[index] > 24) {
        coveredPixels += 1;
      }
    }

    this.coverProgress = this._maskPixelCount > 0
      ? Utils.clamp((coveredPixels / this._maskPixelCount) * 100, 0, 100)
      : 0;
    this._updateCoverProgress();

    if (this.coverProgress >= (CONFIG.coatCoverageCompleteThreshold || 99.5) && this.step === 'coat') {
      this._onCoatDone();
    }
  },

  _setHint(text) {
    document.getElementById('cream-hint').textContent = text;
  },

  _setMixerActive(active) {
    this.mixerTool.classList.toggle('active', active);
  },

  _setStageLayout(mode) {
    const coatStage = mode === 'coat' || mode === 'ready';
    this.area.classList.toggle('hidden', coatStage);
    this.applyStage.classList.toggle('hidden', !coatStage);
    this.picker.classList.toggle('hidden', mode === 'coat' || mode === 'ready');
    this.progressWrap.classList.toggle('hidden', mode !== 'whip' && mode !== 'whip-ready');
    this._setBottlePickerEnabled(mode === 'color');
  },

  _getAreaPoint(event) {
    const source = event.changedTouches && event.changedTouches.length > 0
      ? event.changedTouches[0]
      : event.touches && event.touches.length > 0
        ? event.touches[0]
        : event;
    const rect = this.area.getBoundingClientRect();
    return {
      x: Utils.clamp(source.clientX - rect.left, 0, rect.width),
      y: Utils.clamp(source.clientY - rect.top, 0, rect.height),
    };
  },

  _getPreviewPoint(event) {
    const source = event.changedTouches && event.changedTouches.length > 0
      ? event.changedTouches[0]
      : event.touches && event.touches.length > 0
        ? event.touches[0]
        : event;
    const rect = this.applyPreview.getBoundingClientRect();
    return {
      x: Utils.clamp(source.clientX - rect.left, 0, rect.width),
      y: Utils.clamp(source.clientY - rect.top, 0, rect.height),
    };
  },

  _getApplyCanvasPoint(event) {
    const source = event.changedTouches && event.changedTouches.length > 0
      ? event.changedTouches[0]
      : event.touches && event.touches.length > 0
        ? event.touches[0]
        : event;
    const rect = this.applyPreview.getBoundingClientRect();
    return {
      x: Utils.clamp((source.clientX - rect.left) * (this.applyCanvas.width / rect.width), 0, this.applyCanvas.width),
      y: Utils.clamp((source.clientY - rect.top) * (this.applyCanvas.height / rect.height), 0, this.applyCanvas.height),
    };
  },

  _getSpatulaPaintPoint() {
    const previewRect = this.applyPreview.getBoundingClientRect();
    const spatulaRect = this.spatulaTool.getBoundingClientRect();
    const contactOffset = this._getSpatulaContactOffset();
    return {
      x: Utils.clamp((spatulaRect.left - previewRect.left + contactOffset.x) * (this.applyCanvas.width / previewRect.width), 0, this.applyCanvas.width),
      y: Utils.clamp((spatulaRect.top - previewRect.top + contactOffset.y) * (this.applyCanvas.height / previewRect.height), 0, this.applyCanvas.height),
    };
  },

  _getSpatulaContactOffset() {
    return {
      x: this.spatulaTool.offsetWidth * 0.18,
      y: this.spatulaTool.offsetHeight * 0.18,
    };
  },

  _placeTool(tool, left, top) {
    const maxLeft = this.area.clientWidth - tool.offsetWidth;
    const maxTop = this.area.clientHeight - tool.offsetHeight;
    tool.style.left = `${Utils.clamp(left, 0, maxLeft)}px`;
    tool.style.top = `${Utils.clamp(top, 0, maxTop)}px`;
  },

  _placeToolInPreview(tool, left, top) {
    const maxLeft = this.applyPreview.clientWidth - tool.offsetWidth;
    const maxTop = this.applyPreview.clientHeight - tool.offsetHeight;
    tool.style.left = `${Utils.clamp(left, 0, maxLeft)}px`;
    tool.style.top = `${Utils.clamp(top, 0, maxTop)}px`;
  },

  _placeSpatulaInPreview(point) {
    const contactOffset = this._getSpatulaContactOffset();
    const minLeft = -contactOffset.x;
    const minTop = -contactOffset.y;
    const maxLeft = this.applyPreview.clientWidth - contactOffset.x;
    const maxTop = this.applyPreview.clientHeight - contactOffset.y;
    this.spatulaTool.style.left = `${Utils.clamp(point.x - contactOffset.x, minLeft, maxLeft)}px`;
    this.spatulaTool.style.top = `${Utils.clamp(point.y - contactOffset.y, minTop, maxTop)}px`;
  },

  _getMixerTipPoint() {
    const areaRect = this.area.getBoundingClientRect();
    const mixerRect = this.mixerTool.getBoundingClientRect();
    return {
      x: mixerRect.left - areaRect.left + mixerRect.width * 0.5,
      y: mixerRect.top - areaRect.top + mixerRect.height * 0.86,
    };
  },

  _resetTool(tool) {
    if (!tool?.dataset?.homeLeft || !tool?.dataset?.homeTop) {
      return;
    }
    tool.style.left = tool.dataset.homeLeft;
    tool.style.top = tool.dataset.homeTop;
  },

  _paintCoverage(fromPoint, toPoint) {
    this._coverageCtx.save();
    this._coverageCtx.strokeStyle = 'rgba(255,255,255,0.95)';
    this._coverageCtx.lineCap = 'round';
    this._coverageCtx.lineJoin = 'round';
    this._coverageCtx.lineWidth = Math.max(24, this.applyCanvas.width * 0.075);
    this._coverageCtx.beginPath();
    this._coverageCtx.moveTo(fromPoint.x, fromPoint.y);
    this._coverageCtx.lineTo(toPoint.x, toPoint.y);
    this._coverageCtx.stroke();
    this._coverageCtx.beginPath();
    this._coverageCtx.arc(toPoint.x, toPoint.y, Math.max(10, this.applyCanvas.width * 0.028), 0, Math.PI * 2);
    this._coverageCtx.fillStyle = 'rgba(255,255,255,0.88)';
    this._coverageCtx.fill();
    this._coverageCtx.restore();
  },

  _getBowlMetrics() {
    const areaRect = this.area.getBoundingClientRect();
    const bowlRect = this.bowlArea.getBoundingClientRect();
    const scaleX = this.canvas.width / areaRect.width;
    const scaleY = this.canvas.height / areaRect.height;
    const left = (bowlRect.left - areaRect.left) * scaleX;
    const top = (bowlRect.top - areaRect.top) * scaleY;
    const width = bowlRect.width * scaleX;
    const height = bowlRect.height * scaleY;
    return {
      left,
      top,
      width,
      height,
      cx: left + width * 0.5,
      cy: top + height * 0.42,
    };
  },

  _isPointInBowl(point) {
    const bowlRect = this.bowlArea.getBoundingClientRect();
    const areaRect = this.area.getBoundingClientRect();
    const cx = bowlRect.left - areaRect.left + bowlRect.width * 0.5;
    const cy = bowlRect.top - areaRect.top + bowlRect.height * 0.42;
    return Utils.isInEllipse(point.x, point.y, cx, cy, bowlRect.width * 0.38, bowlRect.height * 0.28);
  },

  _getBowlAngle(point) {
    const bowlRect = this.bowlArea.getBoundingClientRect();
    const areaRect = this.area.getBoundingClientRect();
    const cx = bowlRect.left - areaRect.left + bowlRect.width * 0.5;
    const cy = bowlRect.top - areaRect.top + bowlRect.height * 0.42;
    return Utils.angle(cx, cy, point.x, point.y);
  },

  _clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },

  _onWhipDone() {
    this.step = 'whip-ready';
    this._setMixerActive(false);
    this._setStageLayout('whip-ready');
    this._setHint('奶油已经打发好，点右下角进入滴入色素');
    this._showNextButton('完成打发奶油，去滴入色素', () => {
      this.step = 'color';
      this._setStageLayout('color');
      this._hideNextButton();
      this._setHint(this._getBottleHintText());
      Utils.showToast('可以开始滴入色素啦', 1400);
    });
    Utils.showToast('奶油已经打发好，准备进入滴色步骤 ✅', 1500);
  },

  _onColorDone() {
    this.step = 'color-ready';
    this._setStageLayout('color-ready');
    this._setHint('色素已经滴好了，点右下角开始抹面');
    this._showNextButton('完成滴入色素，去抹面', () => {
      this.step = 'coat';
      this._setHint('奶油上色完成，拖动抹刀把奶油盖到蛋糕胚上');
      this._setStageLayout('coat');
      this._hideNextButton();
      this.spatulaTool.classList.remove('hidden');
      this._resizeApplyCanvas();
      this._setupApplyPreview();
      this._renderApplyPreview();
      this._updateCoverProgress();
      this._rememberSpatulaHome();
      this._resetTool(this.spatulaTool);
      App.saveState();
      Utils.showToast('开始给蛋糕抹面吧 ✅', 1500);
    });
    Utils.showToast('色素已经滴好了，下一步可以去抹面', 1500);
  },

  _onCoatDone() {
    if (this.step === 'ready') {
      return;
    }

    this._coverageCtx.clearRect(0, 0, this._coverageCanvas.width, this._coverageCanvas.height);
    this._coverageCtx.drawImage(this._applyMaskCanvas, 0, 0);
    this.coverProgress = 100;
    this._updateCoverProgress();
    this._renderApplyPreview();

    this.step = 'ready';
    this._setHint('蛋糕已经裹上奶油，可以开始装饰和涂鸦了');
    this._setStageLayout('ready');
    this._showNextButton('完成抹面，开始装饰', () => {
      App.goTo('mod-decorate');
    });
    App.saveState();
    Utils.showToast('抹面完成，可以开始装饰啦 🎂', 1500);
  },

  destroy() {
    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
      this._animationFrame = null;
    }
    this._hideNextButton();
    this._destroyBottleGhost();
    this._cleanupFns.forEach((cleanup) => cleanup());
    this._cleanupFns = [];
    this.eggTool.style.visibility = 'visible';
    this._resetTool(this.eggTool);
    this._resetTool(this.mixerTool);
    this._resetTool(this.spatulaTool);
    this._setMixerActive(false);
    this._setLoadingState(false);
    this._clearCanvas();
  },
};
