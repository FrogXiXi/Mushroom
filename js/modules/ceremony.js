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
  _blowDetectionFrame: 0,
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
    this.actionBtn.textContent = '许完愿了，去吹蜡烛';
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
        glow.addColorStop(0, 'rgba(255, 214, 124, 0.55)');
        glow.addColorStop(0.4, 'rgba(255, 186, 78, 0.28)');
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

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'screen';

    this._candles.forEach((candle) => {
      if (!candle.lit || candle.blown) {
        return;
      }
      const size = candle.img
        ? Utils.getDecorationRenderSize(candle.img, this._layout.frame, candle.scale || 0.18)
        : { width: this._layout.frame.width * 0.08, height: this._layout.frame.width * 0.16 };
      const glowX = candle.absX;
      const flameGlowY = candle.absY - size.height * 0.34;
      const castGlowY = candle.absY + size.height * 0.2;
      const flameRadius = Math.max(size.width, size.height) * 1.35;
      const castRadiusX = Math.max(size.width, size.height) * 1.9;
      const castRadiusY = Math.max(size.width, size.height) * 1.08;

      const flameGlow = this.ctx.createRadialGradient(glowX, flameGlowY, flameRadius * 0.02, glowX, flameGlowY, flameRadius);
      flameGlow.addColorStop(0, 'rgba(255, 247, 224, 0.36)');
      flameGlow.addColorStop(0.4, 'rgba(255, 218, 148, 0.24)');
      flameGlow.addColorStop(1, 'rgba(255, 170, 88, 0)');
      this.ctx.fillStyle = flameGlow;
      this.ctx.beginPath();
      this.ctx.arc(glowX, flameGlowY, flameRadius, 0, Math.PI * 2);
      this.ctx.fill();

      const castGlow = this.ctx.createRadialGradient(glowX, castGlowY, castRadiusY * 0.05, glowX, castGlowY, castRadiusX);
      castGlow.addColorStop(0, 'rgba(255, 228, 176, 0.22)');
      castGlow.addColorStop(0.45, 'rgba(255, 198, 116, 0.14)');
      castGlow.addColorStop(1, 'rgba(255, 172, 92, 0)');
      this.ctx.fillStyle = castGlow;
      this.ctx.beginPath();
      this.ctx.ellipse(glowX, castGlowY, castRadiusX, castRadiusY, 0, 0, Math.PI * 2);
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
      if (this._allBlown) {
        App.goTo('mod-cake-cut');
        return;
      }

      if (!this._allLit || this._blowPhaseStarted) {
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

    const candleGlows = this._candles
      .filter((candle) => candle.lit && !candle.blown)
      .flatMap((candle) => {
        const size = candle.img
          ? Utils.getDecorationRenderSize(candle.img, this._layout.frame, candle.scale || 0.18)
          : { width: this._layout.frame.width * 0.08, height: this._layout.frame.width * 0.16 };
        const glowX = canvasRect.left + candle.absX * scaleX;
        const flameGlowY = canvasRect.top + (candle.absY - size.height * 0.58) * scaleY;
        const castGlowY = canvasRect.top + (candle.absY + size.height * 0.14) * scaleY;
        const flameRadius = Math.max(size.width * scaleX, size.height * scaleY) * 1.8;
        const castRadius = Math.max(size.width * scaleX, size.height * scaleY) * 2.8;
        return [
          `radial-gradient(circle at ${glowX}px ${flameGlowY}px, rgba(255,238,202,0.34) 0px, rgba(255,208,132,0.18) ${flameRadius * 0.34}px, rgba(10,8,14,0) ${flameRadius}px)`,
          `radial-gradient(ellipse at ${glowX}px ${castGlowY}px, rgba(255,225,170,0.16) 0px, rgba(255,192,110,0.08) ${castRadius * 0.34}px, rgba(10,8,14,0) ${castRadius}px)`,
        ];
      });

    const roomDarkness = 'linear-gradient(rgba(6, 5, 10, 0.82), rgba(6, 5, 10, 0.9))';
    this.overlay.style.background = `${candleGlows.join(', ')}${candleGlows.length ? ', ' : ''}${roomDarkness}`;
  },

  _onAllCandlesLit() {
    this.hintEl.textContent = '默念愿望后，点右下角进入吹蜡烛';
    setTimeout(() => {
      this.wishText.classList.remove('hidden');
      this.wishText.classList.add('anim-breathe');
      this.actionBtn.textContent = '许完愿了，去吹蜡烛';
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
      this._micMode = false;
      this.hintEl.textContent = '点击蜡烛火焰熄灭蜡烛';
      return;
    }

    const constraints = {
      audio: {
        channelCount: { ideal: 1 },
        echoCancellation: { ideal: false },
        noiseSuppression: { ideal: false },
        autoGainControl: { ideal: false },
      },
    };

    navigator.mediaDevices.getUserMedia(constraints)
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
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      this._micMode = false;
      this.hintEl.textContent = '点击蜡烛火焰熄灭蜡烛';
      return;
    }

    this._stopMicCapture();
    this._stream = stream;
    this._audioCtx = new AudioContextClass();
    const source = this._audioCtx.createMediaStreamSource(stream);
    this._analyser = this._audioCtx.createAnalyser();
    this._analyser.fftSize = 512;
    this._analyser.smoothingTimeConstant = 0.18;
    source.connect(this._analyser);

    const frequencyData = new Uint8Array(this._analyser.frequencyBinCount);
    const waveformData = new Uint8Array(this._analyser.fftSize);
    let baselineScore = 0;
    let baselineBass = 0;
    let warmupFrames = 0;
    let blowFrames = 0;

    const check = () => {
      if (this._allBlown || !this._analyser) {
        this._stopMicCapture();
        return;
      }

      this._analyser.getByteFrequencyData(frequencyData);
      this._analyser.getByteTimeDomainData(waveformData);

      const avgFrequency = frequencyData.reduce((sum, value) => sum + value, 0) / frequencyData.length;
      const bassBins = Math.max(8, Math.floor(frequencyData.length * 0.08));
      const bassEnergy = frequencyData.slice(0, bassBins).reduce((sum, value) => sum + value, 0) / bassBins;
      let squareSum = 0;
      let peak = 0;
      for (let index = 0; index < waveformData.length; index += 1) {
        const normalized = Math.abs(waveformData[index] - 128);
        squareSum += normalized * normalized;
        peak = Math.max(peak, normalized);
      }
      const rms = Math.sqrt(squareSum / waveformData.length);
      const blowScore = rms * 1.35 + peak * 0.65 + bassEnergy * 0.4 + avgFrequency * 0.25;

      if (warmupFrames < 10) {
        baselineScore = warmupFrames === 0 ? blowScore : baselineScore * 0.72 + blowScore * 0.28;
        baselineBass = warmupFrames === 0 ? bassEnergy : baselineBass * 0.72 + bassEnergy * 0.28;
        warmupFrames += 1;
      } else {
        baselineScore = baselineScore * 0.96 + blowScore * 0.04;
        baselineBass = baselineBass * 0.96 + bassEnergy * 0.04;
      }

      const dynamicScoreThreshold = Math.max(20, baselineScore * 1.85);
      const dynamicBassThreshold = Math.max(10, baselineBass * 1.6);
      const burstDetected = blowScore >= dynamicScoreThreshold && (peak >= 16 || rms >= 9);
      const sustainedDetected = blowScore >= Math.max(16, baselineScore * 1.45)
        && bassEnergy >= dynamicBassThreshold
        && rms >= 7;

      if (burstDetected || sustainedDetected) {
        blowFrames += 1;
      } else {
        blowFrames = Math.max(0, blowFrames - 1);
      }

      if (blowFrames >= 8) {
        this._candles.forEach((candle) => {
          candle.blown = true;
        });
        this._draw();
        this._onAllBlown();
        this._stopMicCapture();
        return;
      }

      this._blowDetectionFrame = requestAnimationFrame(check);
    };

    const startDetection = () => {
      this._blowDetectionFrame = requestAnimationFrame(check);
    };

    if (typeof this._audioCtx.resume === 'function' && this._audioCtx.state === 'suspended') {
      this._audioCtx.resume().then(startDetection).catch(startDetection);
      return;
    }

    startDetection();
  },

  _stopMicCapture(closeAudioContext = true) {
    cancelAnimationFrame(this._blowDetectionFrame);
    this._blowDetectionFrame = 0;

    if (this._stream) {
      this._stream.getTracks().forEach((track) => track.stop());
      this._stream = null;
    }

    this._analyser = null;

    if (closeAudioContext && this._audioCtx) {
      this._audioCtx.close();
      this._audioCtx = null;
    }
  },

  _onAllBlown() {
    this._allBlown = true;
    this._lightsOff = false;
    this.wishText.classList.add('hidden');
    this.actionBtn.textContent = '完成吹蜡烛，去切蛋糕';
    this.actionBtn.classList.remove('hidden');
    this.hintEl.textContent = '蜡烛已经吹灭，点右下角切蛋糕';
    this._draw();
    this.overlay.style.background = 'rgba(0,0,0,0)';
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
    this._stopMicCapture();
  },
};