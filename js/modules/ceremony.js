/**
 * 模块7: 蜡烛仪式（关灯→点蜡→许愿→吹蜡）
 */
const CeremonyModule = {
  _candles: [],
  _allLit: false,
  _allBlown: false,
  _cakeLayers: [],
  _decorationImages: new Map(),
  _layout: null,
  _maskCanvas: null,
  _flameImg: null,
  _micMode: false,
  _blowPhaseStarted: false,
  _lightsOff: false,
  _audioCtx: null,
  _analyser: null,
  _stream: null,
  _animationFrame: 0,
  _cleanupFns: [],

  async init() {
    this.canvas = document.getElementById('ceremony-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.overlay = document.getElementById('ceremony-overlay');
    this.hintEl = document.getElementById('ceremony-hint');
    this.wishText = document.getElementById('ceremony-wish-text');
    this.actionBtn = document.getElementById('ceremony-action-btn');

    this._allLit = false;
    this._allBlown = false;
    this._micMode = false;
    this._blowPhaseStarted = false;
    this._lightsOff = true;
    this._resetUi();
    this._resizeCanvas(this.canvas);
    await this._loadAssets();
    this._layout = Utils.getCakeLayout(this.canvas, this._cakeLayers);
    this._maskCanvas = Utils.createMaskCanvas(this.canvas.width, this.canvas.height, this._layout);
    this._setupCandles();
    this._bindEvents();
    this._animate();
    this.hintEl.textContent = '先点亮蜡烛，再开始吹蜡烛';
  },

  _resetUi() {
    this.overlay.classList.remove('dark');
    this.overlay.style.transition = '';
    this.overlay.style.background = 'rgba(0,0,0,0)';
    this.wishText.classList.add('hidden');
    this.wishText.classList.remove('anim-breathe');
    this.actionBtn.classList.add('hidden');
    this.actionBtn.textContent = '开始吹蜡烛';
  },

  async _loadAssets() {
    this._cakeLayers = await Utils.loadCakeLayers(App.state.cakeType || 'single');
    this._decorationImages = await Utils.loadDecorationImagesForState(App.state.decorations || []);

    // 只加载单张火焰图片
    try {
      this._flameImg = await Utils.loadImage(CONFIG.flameSrc);
    } catch (error) {
      this._flameImg = null;
      console.warn('flame load failed', error);
    }
  },

  _resizeCanvas(canvas) {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.max(360, Math.round(rect.width * 2));
    canvas.height = Math.max(420, Math.round(rect.height * 2));
  },

  _setupCandles() {
    const decorations = App.state.decorations || [];
    this._candles = decorations
      .filter((item) => item.isCandle)
      .map((item) => {
        const position = Utils.getDecorationPosition(item, this._layout.frame);
        return {
          src: item.src,
          img: this._decorationImages.get(item.src) || null,
          scale: item.scale || 0.18,
          rotation: item.rotation || 0,
          absX: position.x,
          absY: position.y,
          lit: false,
          blown: false,
        };
      });

    if (this._candles.length === 0) {
      this._candles.push({
        src: null,
        img: null,
        scale: 0.18,
        rotation: 0,
        absX: this._layout.frame.x + this._layout.frame.width / 2,
        absY: this._layout.frame.y + this._layout.frame.height * 0.2,
        lit: false,
        blown: false,
      });
    }
  },

  _animate() {
    this._draw();
    if (!this._allBlown) {
      this._animationFrame = requestAnimationFrame(() => this._animate());
    }
  },

  _draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const decorations = (App.state.decorations || []).filter((item) => !item.isCandle);
    Utils.drawCakeArtwork(this.ctx, {
      layout: this._layout,
      maskCanvas: this._maskCanvas,
      creamColor: App.state.creamColor || CONFIG.creamColors[0],
      strokes: App.state.paintStrokes || [],
      decorations,
      decorationImages: this._decorationImages,
    });

    if (this._lightsOff && !this._allBlown) {
      this._drawSceneCandlelight();
    }

    // 绘制蜡烛和火焰
    this._candles.forEach((candle) => {
      const size = candle.img
        ? Utils.getDecorationRenderSize(candle.img, this._layout.frame, candle.scale || 0.18)
        : { width: this._layout.frame.width * 0.08, height: this._layout.frame.width * 0.16 };
      const candleTop = candle.absY - size.height / 2;

      this.ctx.save();
      this.ctx.translate(candle.absX, candle.absY);
      this.ctx.rotate(candle.rotation || 0);
      if (candle.img) {
        this.ctx.drawImage(candle.img, -size.width / 2, -size.height / 2, size.width, size.height);
      } else {
        this.ctx.fillStyle = '#FFB5A7';
        this.ctx.fillRect(-size.width * 0.18, -size.height / 2, size.width * 0.36, size.height * 0.88);
      }
      this.ctx.restore();

      if (candle.lit && !candle.blown) {
        const glowX = candle.absX;
        const glowY = candleTop - size.height * 0.08;
        const glowRadius = Math.max(size.width, size.height) * 0.9;
        this.ctx.save();
        const glow = this.ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowRadius);
        glow.addColorStop(0, 'rgba(255, 200, 80, 0.35)');
        glow.addColorStop(0.4, 'rgba(255, 180, 60, 0.15)');
        glow.addColorStop(1, 'rgba(255, 160, 40, 0)');
        this.ctx.fillStyle = glow;
        this.ctx.beginPath();
        this.ctx.arc(glowX, glowY, glowRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        if (this._flameImg) {
          const flameWidth = Math.max(size.width * 0.34, 18);
          const flameHeight = flameWidth * (this._flameImg.height / this._flameImg.width);
          this.ctx.drawImage(this._flameImg, candle.absX - flameWidth / 2, candleTop - flameHeight * 0.84, flameWidth, flameHeight);
        } else {
          this.ctx.fillStyle = 'rgba(255, 211, 84, 0.95)';
          this.ctx.beginPath();
          this.ctx.ellipse(candle.absX, candleTop - size.height * 0.08, size.width * 0.08, size.height * 0.14, 0, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    });

    this._updateDarkOverlay();
  },

  _drawSceneCandlelight() {
    if (!this._layout?.frame) {
      return;
    }

    const frame = this._layout.frame;
    const centerX = frame.x + frame.width / 2;
    const centerY = frame.y + frame.height * 0.48;
    const cakeRadius = Math.max(frame.width, frame.height) * 0.78;

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'screen';

    const cakeGlow = this.ctx.createRadialGradient(centerX, centerY, cakeRadius * 0.08, centerX, centerY, cakeRadius);
    cakeGlow.addColorStop(0, 'rgba(255, 239, 205, 0.18)');
    cakeGlow.addColorStop(0.34, 'rgba(255, 221, 173, 0.12)');
    cakeGlow.addColorStop(0.7, 'rgba(255, 196, 120, 0.06)');
    cakeGlow.addColorStop(1, 'rgba(255, 172, 92, 0)');
    this.ctx.fillStyle = cakeGlow;
    this.ctx.beginPath();
    this.ctx.ellipse(centerX, centerY, cakeRadius * 0.96, cakeRadius * 0.76, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this._candles.forEach((candle) => {
      if (!candle.lit || candle.blown) {
        return;
      }
      const size = candle.img
        ? Utils.getDecorationRenderSize(candle.img, this._layout.frame, candle.scale || 0.18)
        : { width: this._layout.frame.width * 0.08, height: this._layout.frame.width * 0.16 };
      const glowX = candle.absX;
      const glowY = candle.absY - size.height * 0.24;
      const glowRadius = Math.max(size.width, size.height) * 2.1;
      const glow = this.ctx.createRadialGradient(glowX, glowY - size.height * 0.3, glowRadius * 0.06, glowX, glowY, glowRadius);
      glow.addColorStop(0, 'rgba(255, 247, 224, 0.24)');
      glow.addColorStop(0.38, 'rgba(255, 218, 148, 0.16)');
      glow.addColorStop(0.72, 'rgba(255, 182, 98, 0.08)');
      glow.addColorStop(1, 'rgba(255, 160, 80, 0)');
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.ellipse(glowX, glowY, glowRadius * 0.92, glowRadius * 0.7, 0, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.restore();
  },

  _bindEvents() {
    const onCanvasPointer = (event) => {
      const point = Utils.getCanvasPos(this.canvas, event);
      const hit = this._hitTestCandle(point);
      if (hit < 0) {
        return;
      }

      const candle = this._candles[hit];
      if (!this._allLit) {
        candle.lit = true;
        if (this._candles.every((item) => item.lit)) {
          this._allLit = true;
          this._onAllCandlesLit();
        }
        this._draw();
        return;
      }

      if (this._blowPhaseStarted && !this._allBlown && !candle.blown) {
        candle.blown = true;
        this._draw();
        if (this._candles.every((item) => item.blown)) {
          this._onAllBlown();
        }
      }
    };

    const onAction = () => {
      if (!this._allLit || this._allBlown) {
        return;
      }
      this._beginBlowPhase();
    };

    this.canvas.addEventListener('pointerdown', onCanvasPointer);
    this.actionBtn.onclick = onAction;
    this._cleanupFns.push(() => {
      this.canvas.removeEventListener('pointerdown', onCanvasPointer);
      this.actionBtn.onclick = null;
    });
  },

  _hitTestCandle(point) {
    for (let index = this._candles.length - 1; index >= 0; index -= 1) {
      const candle = this._candles[index];
      const size = candle.img
        ? Utils.getDecorationRenderSize(candle.img, this._layout.frame, candle.scale || 0.18)
        : { width: this._layout.frame.width * 0.08, height: this._layout.frame.width * 0.16 };
      if (Math.abs(point.x - candle.absX) <= size.width * 0.55 && Math.abs(point.y - candle.absY) <= size.height * 0.55) {
        return index;
      }
    }
    return -1;
  },

  _updateDarkOverlay() {
    if (!this.overlay) {
      return;
    }

    if (!this._lightsOff || this._allBlown || !this._layout?.frame) {
      this.overlay.style.background = 'rgba(0,0,0,0)';
      return;
    }

    const canvasRect = this.canvas.getBoundingClientRect();
    const scaleX = canvasRect.width / this.canvas.width;
    const scaleY = canvasRect.height / this.canvas.height;
    const frame = this._layout.frame;
    const cakeCenterX = canvasRect.left + (frame.x + frame.width * 0.5) * scaleX;
    const cakeCenterY = canvasRect.top + (frame.y + frame.height * 0.52) * scaleY;
    const cakeRadius = Math.max(frame.width * scaleX, frame.height * scaleY) * 0.96;

    const candleGlows = this._candles
      .filter((candle) => candle.lit && !candle.blown)
      .map((candle) => {
        const size = candle.img
          ? Utils.getDecorationRenderSize(candle.img, this._layout.frame, candle.scale || 0.18)
          : { width: this._layout.frame.width * 0.08, height: this._layout.frame.width * 0.16 };
        const glowX = canvasRect.left + candle.absX * scaleX;
        const glowY = canvasRect.top + (candle.absY - size.height * 0.56) * scaleY;
        const radius = Math.max(size.width * scaleX, size.height * scaleY) * 2.65;
        return `radial-gradient(circle at ${glowX}px ${glowY}px, rgba(255,236,198,0.24) 0px, rgba(255,206,128,0.16) ${radius * 0.2}px, rgba(78,53,25,0.14) ${radius * 0.5}px, rgba(10,8,14,0) ${radius}px)`;
      });

    const sceneGlow = `radial-gradient(ellipse at ${cakeCenterX}px ${cakeCenterY}px, rgba(255,245,219,0.08) 0px, rgba(74,54,29,0.16) ${cakeRadius * 0.26}px, rgba(17,13,20,0.62) ${cakeRadius * 0.6}px, rgba(5,4,9,0.9) ${cakeRadius * 1.34}px)`;
    const roomDarkness = 'linear-gradient(rgba(8, 6, 12, 0.68), rgba(8, 6, 12, 0.78))';
    this.overlay.style.background = `${candleGlows.join(',')}${candleGlows.length ? ', ' : ''}${sceneGlow}, ${roomDarkness}`;
  },

  _onAllCandlesLit() {
    this.hintEl.textContent = '默念愿望后，点击按钮开始吹蜡烛';
    setTimeout(() => {
      this.wishText.classList.remove('hidden');
      this.wishText.classList.add('anim-breathe');
      this.actionBtn.classList.remove('hidden');
    }, 700);
  },

  _beginBlowPhase() {
    this._blowPhaseStarted = true;
    this.wishText.classList.add('hidden');
    this.actionBtn.classList.add('hidden');
    this.hintEl.textContent = '对着屏幕吹气，或直接点蜡烛火苗';
    this._requestMic();
  },

  _requestMic() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.hintEl.textContent = '点击蜡烛火焰熄灭蜡烛';
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        this._micMode = true;
        this._stream = stream;
        this.hintEl.textContent = '对着屏幕吹气，或直接点蜡烛火苗';
        this._startBlowDetection(stream);
      })
      .catch(() => {
        this._micMode = false;
        this.hintEl.textContent = '点击蜡烛火焰熄灭蜡烛';
      });
  },

  _startBlowDetection(stream) {
    this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = this._audioCtx.createMediaStreamSource(stream);
    this._analyser = this._audioCtx.createAnalyser();
    this._analyser.fftSize = 256;
    source.connect(this._analyser);

    const data = new Uint8Array(this._analyser.frequencyBinCount);
    let blowStart = 0;

    const check = () => {
      if (this._allBlown) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      this._analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;

      if (avg > 40) {
        if (!blowStart) blowStart = Date.now();
        if (Date.now() - blowStart > 500) {
          this._candles.forEach((candle) => {
            candle.blown = true;
          });
          this._draw();
          this._onAllBlown();
          stream.getTracks().forEach(t => t.stop());
          return;
        }
      } else {
        blowStart = 0;
      }
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  },

  _onAllBlown() {
    this._allBlown = true;
    this._lightsOff = false;
    this.wishText.classList.add('hidden');
    this.actionBtn.classList.add('hidden');
    this.hintEl.textContent = '';
    this._draw();
    this.overlay.style.background = 'rgba(0,0,0,0)';

    setTimeout(() => {
      App.goTo('mod-cake-cut');
    }, 1100);
  },

  destroy() {
    this._candles = [];
    this._allLit = false;
    this._allBlown = false;
    this._blowPhaseStarted = false;
    this._lightsOff = false;
    this._resetUi();
    cancelAnimationFrame(this._animationFrame);
    this._cleanupFns.forEach((cleanup) => cleanup());
    this._cleanupFns = [];
    if (this._stream) {
      this._stream.getTracks().forEach((track) => track.stop());
      this._stream = null;
    }
    if (this._audioCtx) {
      this._audioCtx.close();
      this._audioCtx = null;
    }
    this._analyser = null;
  },
};