(function () {
  const Utils = window.BirthdayUtils;

  function createNoiseBuffer(context, duration) {
    const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  class SoundController {
    constructor(elements) {
      this.elements = elements;
      this.context = null;
      this.masterGain = null;
      this.enabled = true;
      this.initElements();
    }

    initElements() {
      if (this.elements.bgm) {
        this.elements.bgm.volume = 0.26;
      }

      if (this.elements.celebrate) {
        this.elements.celebrate.volume = 0.32;
      }
    }

    ensureContext() {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        return null;
      }

      if (!this.context) {
        this.context = new AudioContext();
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = 0.14;
        this.masterGain.connect(this.context.destination);
      }

      return this.context;
    }

    unlock() {
      const context = this.ensureContext();
      if (context && context.state === "suspended") {
        context.resume().catch(function () {});
      }
    }

    play(key, options) {
      const settings = options || {};
      const element = this.elements[key];
      if (!this.enabled || !element) {
        this.playSynth(key);
        return Promise.resolve(false);
      }

      try {
        if (settings.restart !== false) {
          element.currentTime = 0;
        }

        if (typeof settings.volume === "number") {
          element.volume = settings.volume;
        }

        return element.play().then(function () {
          return true;
        }).catch(() => {
          this.playSynth(key);
          return false;
        });
      } catch (error) {
        this.playSynth(key);
        return Promise.resolve(false);
      }
    }

    pause(key) {
      const element = this.elements[key];
      if (element) {
        element.pause();
      }
    }

    startAmbient() {
      if (!this.enabled) {
        return;
      }

      this.pause("celebrate");
      this.play("bgm", { restart: false, volume: 0.26 });
    }

    enterWishMode() {
      this.pause("bgm");
    }

    startCelebrateTrack() {
      if (!this.enabled) {
        return;
      }

      this.pause("bgm");
      this.play("celebrate", { restart: false, volume: 0.32 });
    }

    toggleMusic() {
      this.enabled = !this.enabled;

      if (!this.enabled) {
        this.pause("bgm");
        this.pause("celebrate");
      }

      return this.enabled;
    }

    playLight() {
      this.play("light", { volume: 0.72 });
    }

    playBlow() {
      this.play("blow", { volume: 0.54 });
    }

    playOut() {
      this.play("out", { volume: 0.74 });
    }

    playCheer() {
      this.play("cheer", { volume: 0.58 });
    }

    playAnimal() {
      this.play("animal", { volume: 0.52 });
    }

    playConfetti() {
      this.play("confetti", { volume: 0.48 });
    }

    switchCelebrationTrack() {
      this.playSynth("celebrate");
    }

    playSynth(type) {
      const context = this.ensureContext();
      if (!context || !this.masterGain) {
        return;
      }

      const start = context.currentTime;

      if (type === "light") {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(760, start);
        oscillator.frequency.exponentialRampToValueAtTime(980, start + 0.12);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
        oscillator.connect(gain).connect(this.masterGain);
        oscillator.start(start);
        oscillator.stop(start + 0.18);
        return;
      }

      if (type === "out" || type === "blow") {
        const source = context.createBufferSource();
        const highpass = context.createBiquadFilter();
        const lowpass = context.createBiquadFilter();
        const gain = context.createGain();
        source.buffer = createNoiseBuffer(context, 0.28);
        highpass.type = "highpass";
        highpass.frequency.value = type === "blow" ? 80 : 180;
        lowpass.type = "lowpass";
        lowpass.frequency.value = type === "blow" ? 1300 : 900;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(type === "blow" ? 0.26 : 0.18, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);
        source.connect(highpass).connect(lowpass).connect(gain).connect(this.masterGain);
        source.start(start);
        source.stop(start + 0.28);
        return;
      }

      if (type === "celebrate" || type === "cheer" || type === "animal" || type === "confetti") {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = type === "celebrate" ? "square" : "sine";
        oscillator.frequency.setValueAtTime(type === "animal" ? 660 : 520, start);
        oscillator.frequency.exponentialRampToValueAtTime(type === "celebrate" ? 780 : 920, start + 0.22);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.18, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.34);
        oscillator.connect(gain).connect(this.masterGain);
        oscillator.start(start);
        oscillator.stop(start + 0.36);
      }
    }
  }

  class BlowDetector {
    constructor(options) {
      const settings = options || {};
      this.onProgress = settings.onProgress;
      this.onBlow = settings.onBlow;
      this.onError = settings.onError;
      this.onStateChange = settings.onStateChange;
      this.isMobileDevice = typeof settings.isMobile === "boolean" ? settings.isMobile : Utils.isMobile();
      this.audioContext = null;
      this.stream = null;
      this.source = null;
      this.analyser = null;
      this.freqData = null;
      this.thresholds = { energy: 0.004, ratio: 0.22, flatness: 0.56 };
      this.holdMilliseconds = 0;
      this.cooldownUntil = 0;
      this.frameId = 0;
      this.lastFrameTime = 0;
      this.isRunning = false;
    }

    async start() {
      if (this.isRunning) {
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.fail("当前设备不支持麦克风，将切换为长按吹烛模式。");
        return;
      }

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        this.fail("当前浏览器不支持音频分析，将切换为长按吹烛模式。");
        return;
      }

      try {
        this.audioContext = this.audioContext || new AudioContext();
        if (this.audioContext.state === "suspended") {
          await this.audioContext.resume();
        }

        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });

        this.source = this.audioContext.createMediaStreamSource(this.stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.24;
        this.freqData = new Float32Array(this.analyser.frequencyBinCount);
        this.source.connect(this.analyser);
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.onStateChange && this.onStateChange("calibrating");
        await this.calibrate(2000);
        this.onStateChange && this.onStateChange("listening");
        this.loop();
      } catch (error) {
        this.fail("麦克风权限被拒绝或设备不可用，已切换为长按吹烛模式。");
      }
    }

    async calibrate(duration) {
      const samples = [];
      const startedAt = performance.now();

      await new Promise((resolve) => {
        const sample = () => {
          if (!this.isRunning) {
            resolve();
            return;
          }

          const metrics = this.readMetrics();
          if (metrics) {
            samples.push(metrics);
            this.onProgress && this.onProgress(Utils.clamp((performance.now() - startedAt) / duration, 0, 1) * 0.3, { calibrating: true });
          }

          if (performance.now() - startedAt >= duration) {
            resolve();
            return;
          }

          requestAnimationFrame(sample);
        };

        sample();
      });

      this.thresholds = this.computeThresholds(samples);
      this.onProgress && this.onProgress(0, { calibrating: false });
    }

    computeThresholds(samples) {
      if (!samples.length) {
        return { energy: 0.004, ratio: this.isMobileDevice ? 0.18 : 0.22, flatness: 0.56 };
      }

      const energyValues = samples.map(function (sample) { return sample.lowEnergy; });
      const ratioValues = samples.map(function (sample) { return sample.ratio; });
      const flatnessValues = samples.map(function (sample) { return sample.flatness; });

      const average = function (values) {
        return values.reduce(function (sum, value) { return sum + value; }, 0) / values.length;
      };

      const deviation = function (values, mean) {
        return Math.sqrt(values.reduce(function (sum, value) {
          return sum + Math.pow(value - mean, 2);
        }, 0) / values.length);
      };

      const meanEnergy = average(energyValues);
      const meanRatio = average(ratioValues);
      const meanFlatness = average(flatnessValues);
      const stdEnergy = deviation(energyValues, meanEnergy);
      const stdRatio = deviation(ratioValues, meanRatio);

      return {
        energy: Math.max(0.004, meanEnergy + stdEnergy * (this.isMobileDevice ? 1.85 : 2.35)),
        ratio: Math.max(this.isMobileDevice ? 0.18 : 0.22, meanRatio + stdRatio * (this.isMobileDevice ? 1.4 : 1.75)),
        flatness: Math.max(0.54, meanFlatness + 0.025),
      };
    }

    readMetrics() {
      if (!this.analyser || !this.audioContext || !this.freqData) {
        return null;
      }

      this.analyser.getFloatFrequencyData(this.freqData);
      const binWidth = this.audioContext.sampleRate / this.analyser.fftSize;
      const lowBandValues = [];
      let lowEnergy = 0;
      let speechEnergy = 0;
      let totalEnergy = 0;

      for (let index = 0; index < this.freqData.length; index += 1) {
        const frequency = index * binWidth;
        if (frequency < 80 || frequency > 1800) {
          continue;
        }

        const db = this.freqData[index];
        const amplitude = Number.isFinite(db) ? Math.pow(10, db / 20) : 0;
        totalEnergy += amplitude;

        if (frequency >= 80 && frequency <= 300) {
          lowEnergy += amplitude;
          lowBandValues.push(amplitude + 1e-8);
        }

        if (frequency >= 300 && frequency <= 1200) {
          speechEnergy += amplitude;
        }
      }

      const lowAverage = lowBandValues.length ? lowEnergy / lowBandValues.length : 0;
      const geometricMean = lowBandValues.length ? Math.exp(lowBandValues.reduce(function (sum, value) {
        return sum + Math.log(value);
      }, 0) / lowBandValues.length) : 0;
      const arithmeticMean = lowBandValues.length ? lowBandValues.reduce(function (sum, value) {
        return sum + value;
      }, 0) / lowBandValues.length : 0;

      return {
        lowEnergy: lowAverage,
        ratio: totalEnergy ? lowEnergy / totalEnergy : 0,
        speechRatio: totalEnergy ? speechEnergy / totalEnergy : 0,
        flatness: arithmeticMean ? geometricMean / arithmeticMean : 0,
      };
    }

    loop() {
      if (!this.isRunning) {
        return;
      }

      const metrics = this.readMetrics();
      const now = performance.now();
      const delta = Math.min(100, now - this.lastFrameTime || 16);
      this.lastFrameTime = now;

      if (metrics) {
        const energyScore = Utils.clamp(metrics.lowEnergy / (this.thresholds.energy * 2.4), 0, 1);
        const ratioScore = Utils.clamp((metrics.ratio - this.thresholds.ratio * 0.55) / (1 - this.thresholds.ratio * 0.55), 0, 1);
        const flatnessScore = Utils.clamp(metrics.flatness / this.thresholds.flatness, 0, 1);
        const progress = Utils.clamp(energyScore * 0.5 + ratioScore * 0.35 + flatnessScore * 0.15, 0, 1);

        const likelyBlow = metrics.lowEnergy > this.thresholds.energy
          && metrics.ratio > this.thresholds.ratio
          && metrics.flatness >= this.thresholds.flatness
          && metrics.ratio > metrics.speechRatio;

        if (likelyBlow) {
          this.holdMilliseconds += delta;
        } else {
          this.holdMilliseconds = Math.max(0, this.holdMilliseconds - delta * 1.7);
        }

        this.onProgress && this.onProgress(likelyBlow ? progress : progress * 0.72, {
          likelyBlow: likelyBlow,
          metrics: metrics,
          holdMs: this.holdMilliseconds,
        });

        if (likelyBlow && this.holdMilliseconds >= 300 && now >= this.cooldownUntil) {
          this.cooldownUntil = now + 650;
          this.holdMilliseconds = 0;
          this.onBlow && this.onBlow({
            strength: Utils.clamp(progress + ratioScore * 0.12, 0.55, 1),
            metrics: metrics,
          });
        }
      }

      this.frameId = requestAnimationFrame(() => this.loop());
    }

    stop() {
      this.isRunning = false;
      cancelAnimationFrame(this.frameId);
      this.frameId = 0;
      this.holdMilliseconds = 0;

      if (this.source) {
        this.source.disconnect();
        this.source = null;
      }

      if (this.analyser) {
        this.analyser.disconnect();
        this.analyser = null;
      }

      if (this.stream) {
        this.stream.getTracks().forEach(function (track) {
          track.stop();
        });
        this.stream = null;
      }

      this.onProgress && this.onProgress(0, { likelyBlow: false, holdMs: 0 });
      this.onStateChange && this.onStateChange("stopped");
    }

    fail(message) {
      this.stop();
      this.onError && this.onError(message);
    }
  }

  window.BlowDetection = {
    BlowDetector: BlowDetector,
    SoundController: SoundController,
  };
}());