/**
 * 模块7: 蜡烛仪式（点蜡→关灯→许愿→吹蜡）
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
    this._resetUi();
    this._resizeCanvas(this.canvas);
    await this._loadAssets();
    this._layout = Utils.getCakeLayout(this.canvas, this._cakeLayers);
    this._maskCanvas = Utils.createMaskCanvas(this.canvas.width, this.canvas.height, this._layout);
    this._setupCandles();
    this._bindEvents();
    this._animate();
    this.hintEl.textContent = '点击蜡烛点亮它';
  },

  _resetUi() {
    this.overlay.classList.remove('dark');
    this.overlay.style.transition = '';
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

    // 绘制蜡烛和火焰
    this._candles.forEach((candle) => {
      const size = this._layout.frame.width * (candle.scale || 0.18);

      this.ctx.save();
      this.ctx.translate(candle.absX, candle.absY);
      this.ctx.rotate(candle.rotation || 0);
      if (candle.img) {
        this.ctx.drawImage(candle.img, -size / 2, -size / 2, size, size);
      } else {
        this.ctx.fillStyle = '#FFB5A7';
        this.ctx.fillRect(-size * 0.08, -size / 2, size * 0.16, size * 0.88);
      }
      this.ctx.restore();

      if (candle.lit && !candle.blown) {
        // 灯光发光效果 — 径向渐变光晕
        const glowX = candle.absX;
        const glowY = candle.absY - size * 0.55;
        const glowRadius = size * 1.6;
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

        // 绘制火焰图片（单张静态）
        if (this._flameImg) {
          const flameWidth = size * 0.34;
          const flameHeight = flameWidth * (this._flameImg.height / this._flameImg.width);
          this.ctx.drawImage(this._flameImg, candle.absX - flameWidth / 2, candle.absY - size * 0.72, flameWidth, flameHeight);
        } else {
          this.ctx.fillStyle = 'rgba(255, 211, 84, 0.95)';
          this.ctx.beginPath();
          this.ctx.ellipse(candle.absX, candle.absY - size * 0.45, size * 0.08, size * 0.14, 0, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    });
  },

  _bindEvents() {
    const onCanvasClick = (event) => {
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
          this._startDarkPhase();
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

    this.canvas.addEventListener('click', onCanvasClick);
    this.actionBtn.onclick = onAction;
    this._cleanupFns.push(() => {
      this.canvas.removeEventListener('click', onCanvasClick);
      this.actionBtn.onclick = null;
    });
  },

  _hitTestCandle(point) {
    for (let index = this._candles.length - 1; index >= 0; index -= 1) {
      const candle = this._candles[index];
      const size = this._layout.frame.width * (candle.scale || 0.18);
      if (Utils.distance(point.x, point.y, candle.absX, candle.absY) <= size * 0.45) {
        return index;
      }
    }
    return -1;
  },

  _startDarkPhase() {
    this.overlay.classList.add('dark');
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
    this.wishText.classList.add('hidden');
    this.actionBtn.classList.add('hidden');
    this.hintEl.textContent = '';
    this._draw();

    this.overlay.style.transition = 'background 0.9s ease';
    this.overlay.classList.remove('dark');

    setTimeout(() => {
      App.goTo('mod-cake-cut');
    }, 1100);
  },

  destroy() {
    this._candles = [];
    this._allLit = false;
    this._allBlown = false;
    this._blowPhaseStarted = false;
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