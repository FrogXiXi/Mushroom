(function () {
  const Utils = window.BirthdayUtils;
  const BlowDetector = window.BlowDetection.BlowDetector;
  const SoundController = window.BlowDetection.SoundController;

  class BirthdayPartyApp {
    constructor() {
      this.elements = {
        body: document.body,
        loaderScreen: document.getElementById("loaderScreen"),
        customizeScreen: document.getElementById("customizeScreen"),
        customizeForm: document.getElementById("customizeForm"),
        nameInput: document.getElementById("nameInput"),
        ageInput: document.getElementById("ageInput"),
        themeSwitcher: document.getElementById("themeSwitcher"),
        heroTitle: document.getElementById("heroTitle"),
        heroSubtitle: document.getElementById("heroSubtitle"),
        avatarUploadButton: document.getElementById("avatarUploadButton"),
        avatarFileInput: document.getElementById("avatarFileInput"),
        avatarPreview: document.getElementById("avatarPreview"),
        avatarSketchCanvas: document.getElementById("avatarSketchCanvas"),
        cakeBaseImage: document.getElementById("cakeBaseImage"),
        cakeStage: document.getElementById("cakeStage"),
        cakeCaption: document.getElementById("cakeCaption"),
        standardCandleLayer: document.getElementById("standardCandleLayer"),
        digitCandleLayer: document.getElementById("digitCandleLayer"),
        airflowFill: document.getElementById("airflowFill"),
        statusCopy: document.getElementById("statusCopy"),
        modeTag: document.getElementById("modeTag"),
        promptModal: document.getElementById("promptModal"),
        promptCopy: document.getElementById("promptCopy"),
        startMicButton: document.getElementById("startMicButton"),
        forceFallbackButton: document.getElementById("forceFallbackButton"),
        wishModal: document.getElementById("wishModal"),
        wishTextarea: document.getElementById("wishTextarea"),
        saveWishButton: document.getElementById("saveWishButton"),
        closeWishButton: document.getElementById("closeWishButton"),
        toastShell: document.getElementById("toastShell"),
        blackoutLayer: document.getElementById("blackoutLayer"),
        resetCandlesButton: document.getElementById("resetCandlesButton"),
        fallbackModeButton: document.getElementById("fallbackModeButton"),
        musicToggle: document.getElementById("musicToggle"),
        trackToggle: document.getElementById("trackToggle"),
        effectToggle: document.getElementById("effectToggle"),
        saveCardButton: document.getElementById("saveCardButton"),
        utilityDrawer: document.getElementById("utilityDrawer"),
        menuList: document.getElementById("menuList"),
        menuLockTip: document.getElementById("menuLockTip"),
        shareLinkOutput: document.getElementById("shareLinkOutput"),
        helloKittyActor: document.getElementById("helloKittyActor"),
        heroAndCake: document.getElementById("heroAndCake"),
        audioLight: document.getElementById("audioLight"),
        audioBlow: document.getElementById("audioBlow"),
        audioOut: document.getElementById("audioOut"),
        audioCheer: document.getElementById("audioCheer"),
        audioBgm: document.getElementById("audioBgm"),
        audioCelebrate: document.getElementById("audioCelebrate"),
        audioAnimal: document.getElementById("audioAnimal"),
        audioConfetti: document.getElementById("audioConfetti"),
        floatingLayer: document.getElementById("floatingLayer"),
      };

      this.state = {
        stage: "loading",
        name: "",
        age: "",
        theme: "kitty",
        avatarSketch: "",
        cakeStyle: "cream",
        candles: [],
        usingFallback: false,
        panel: "invite",
        wish: window.localStorage.getItem(Utils.STORAGE_KEYS.wish) || "",
        effectsEnabled: true,
      };

      this.candleElements = new Map();
      this.nextExtinguishAt = 0;
      this.fallbackHold = { active: false, startedAt: 0, frame: 0 };
      this.lastBlowHintAt = 0;
      this.sound = new SoundController({
        light: this.elements.audioLight,
        blow: this.elements.audioBlow,
        out: this.elements.audioOut,
        cheer: this.elements.audioCheer,
        bgm: this.elements.audioBgm,
        celebrate: this.elements.audioCelebrate,
        animal: this.elements.audioAnimal,
        confetti: this.elements.audioConfetti,
      });
      this.detector = new BlowDetector({
        isMobile: Utils.isMobile(),
        onProgress: (progress, payload) => this.updateAirflow(progress, payload),
        onBlow: (payload) => this.handleBlow(payload),
        onError: (message) => this.enableFallbackMode(message),
        onStateChange: (state) => this.handleDetectorState(state),
      });
    }

    init() {
      this.bindEvents();
      this.restoreSharedState();
      this.renderTitle();
      this.renderCandles();
      this.renderWish();
      this.updateShareLink();
      this.updateDrawerView(this.state.panel);
      this.updateMenuState();

      window.setTimeout(() => {
        this.setStage("customize");
      }, 1400);
    }

    bindEvents() {
      this.elements.customizeForm.addEventListener("submit", (event) => this.handleCustomizeSubmit(event));
      this.elements.themeSwitcher.addEventListener("click", (event) => this.handleThemeSelection(event));
      this.elements.avatarUploadButton.addEventListener("click", () => this.elements.avatarFileInput.click());
      this.elements.avatarFileInput.addEventListener("change", (event) => this.handleAvatarFile(event));
      this.elements.startMicButton.addEventListener("click", () => this.startWishByMicrophone());
      this.elements.forceFallbackButton.addEventListener("click", () => this.enableFallbackMode("已切换到长按吹烛模式，长按蛋糕上的蜡烛区域即可吹灭。"));
      this.elements.resetCandlesButton.addEventListener("click", () => this.resetCandles());
      this.elements.fallbackModeButton.addEventListener("click", () => this.enableFallbackMode("已切换到长按吹烛模式，长按蛋糕上的蜡烛区域即可吹灭。"));
      this.elements.musicToggle.addEventListener("click", () => this.toggleMusic());
      this.elements.trackToggle.addEventListener("click", () => this.switchCelebrationTrack());
      this.elements.effectToggle.addEventListener("click", () => this.toggleEffects());
      this.elements.saveCardButton.addEventListener("click", () => this.showToast("贺卡生成功能会在后续提交中完成。"));
      this.elements.saveWishButton.addEventListener("click", () => this.saveWish());
      this.elements.closeWishButton.addEventListener("click", () => this.closeWishModal());
      this.elements.menuList.addEventListener("click", (event) => this.handleMenuClick(event));
      this.elements.helloKittyActor.addEventListener("click", () => this.animateAnimal(this.elements.helloKittyActor, "Hello Kitty在给你打气～"));
      document.querySelectorAll(".animal-card, .pet-preview").forEach((button) => {
        button.addEventListener("click", () => this.animateAnimal(button, "小伙伴正在摇尾巴为你欢呼～"));
      });

      this.elements.cakeStage.addEventListener("pointerdown", (event) => this.handleFallbackPointerDown(event));
      window.addEventListener("pointerup", () => this.stopFallbackHold());
      window.addEventListener("pointercancel", () => this.stopFallbackHold());
      window.addEventListener("pointermove", (event) => this.handlePointerTrail(event));
      window.addEventListener("click", (event) => this.spawnFirework(event.clientX, event.clientY));
    }

    restoreSharedState() {
      const shared = Utils.decodeHashState(window.location.hash);
      if (!shared) {
        return;
      }

      this.state.name = Utils.sanitizeName(shared.n || "");
      this.state.age = String(shared.a || "");
      this.state.theme = shared.t || "kitty";
      this.state.avatarSketch = shared.av || "";
      this.state.wish = shared.w || this.state.wish;

      this.elements.nameInput.value = this.state.name;
      this.elements.ageInput.value = this.state.age;
      this.applyThemeClass();

      if (this.state.avatarSketch) {
        this.elements.avatarPreview.src = this.state.avatarSketch;
      }
    }

    setStage(stage) {
      this.state.stage = stage;
      this.elements.body.dataset.stage = stage;
      this.updateSceneLighting();
      this.updateMenuState();
    }

    handleCustomizeSubmit(event) {
      event.preventDefault();
      const name = Utils.sanitizeName(this.elements.nameInput.value);
      if (!name) {
        this.showToast("先填写寿星姓名，派对才会开始。", true);
        return;
      }

      this.sound.unlock();
      this.state.name = name;
      this.state.age = this.elements.ageInput.value ? String(Math.max(1, Math.min(120, Number(this.elements.ageInput.value)))) : "";
      this.renderTitle();
      this.renderCandles();
      this.syncSharedState();
      this.setStage("lighting");
      this.sound.startAmbient();
      this.showToast("先从中间那根蜡烛开始点亮吧。", true);
    }

    handleThemeSelection(event) {
      const button = event.target.closest(".theme-swatch");
      if (!button) {
        return;
      }

      this.state.theme = button.dataset.theme;
      this.applyThemeClass();
      this.syncSharedState();
    }

    applyThemeClass() {
      this.elements.body.classList.remove("theme-kitty", "theme-pudding", "theme-cinnamon");
      this.elements.body.classList.add("theme-" + this.state.theme);
      this.elements.themeSwitcher.querySelectorAll(".theme-swatch").forEach((swatch) => {
        swatch.classList.toggle("is-active", swatch.dataset.theme === this.state.theme);
      });
    }

    renderTitle() {
      this.elements.heroTitle.innerHTML = this.state.name
        ? "HAPPY BIRTHDAY!<br>" + this.state.name.toUpperCase()
        : "HAPPY BIRTHDAY!<br>HELLO KITTY";
      this.elements.heroSubtitle.textContent = this.state.name
        ? "祝" + this.state.name + "生日快乐，快把蜡烛一根根点亮吧。"
        : "祝你今天也像蜡笔云朵一样软乎乎地发光。";
    }

    buildCandles() {
      const candles = [];
      const positions = [18, 33, 50, 67, 82];
      const colors = ["pink", "blue", "pink", "yellow", "mint"];
      const lightingOrder = [2, 1, 3, 0, 4];

      positions.forEach((position, index) => {
        candles.push({
          id: "base-" + index,
          type: "standard",
          x: position,
          y: 68,
          color: colors[index],
          lightRank: lightingOrder.indexOf(index),
          blowRank: Math.abs(position - 50),
          lit: false,
          out: false,
        });
      });

      if (this.state.age) {
        const digits = this.state.age.slice(0, 3).split("");
        digits.forEach((digit, index) => {
          candles.push({
            id: "digit-" + index,
            type: "digit",
            digit: digit,
            x: digits.length === 1 ? 50 : 46 + index * 10,
            y: 42,
            color: index % 2 === 0 ? "pink" : "yellow",
            lightRank: index,
            blowRank: index,
            lit: false,
            out: false,
          });
        });
      }

      return candles.sort(function (left, right) {
        return left.lightRank - right.lightRank;
      });
    }

    renderCandles() {
      this.state.candles = this.buildCandles();
      this.candleElements.clear();
      this.elements.standardCandleLayer.innerHTML = "";
      this.elements.digitCandleLayer.innerHTML = "";

      this.state.candles.forEach((candle) => {
        const element = document.createElement("button");
        element.type = "button";
        element.className = "candle " + (candle.type === "digit" ? "digit-candle" : "standard-candle") + " is-pending " + candle.color;
        element.style.setProperty("--x", candle.x);
        element.style.setProperty("--y", candle.y);
        element.dataset.candleId = candle.id;
        element.innerHTML = candle.type === "digit"
          ? '<span class="digit-glyph">' + candle.digit + '</span><span class="candle-flame"></span><span class="candle-smoke"></span>'
          : '<span class="candle-core"></span><span class="candle-flame"></span><span class="candle-smoke"></span>';

        element.addEventListener("click", () => this.handleCandleClick(candle.id));
        this.candleElements.set(candle.id, element);

        if (candle.type === "digit") {
          this.elements.digitCandleLayer.appendChild(element);
        } else {
          this.elements.standardCandleLayer.appendChild(element);
        }
      });

      this.updateAirflow(0, { likelyBlow: false });
      this.elements.modeTag.textContent = "等待点亮蜡烛";
      this.elements.statusCopy.textContent = "依次点击蜡烛，把舞台灯光慢慢调暗。";
      this.elements.cakeCaption.textContent = "先从中间开始点亮蜡烛，再一起许愿吧。";
    }

    handleCandleClick(candleId) {
      if (this.state.stage !== "lighting") {
        return;
      }

      const nextCandle = this.state.candles.filter((candle) => !candle.lit && !candle.out).sort(function (left, right) {
        return left.lightRank - right.lightRank;
      })[0];

      if (!nextCandle || nextCandle.id !== candleId) {
        this.showToast("要从更靠中间的蜡烛开始点亮哦。", true);
        return;
      }

      nextCandle.lit = true;
      const element = this.candleElements.get(candleId);
      element.classList.remove("is-pending");
      element.classList.add("is-lit");
      this.sound.playLight();
      this.animateAnimal(this.elements.helloKittyActor, "小伙伴在为你点亮的这根蜡烛鼓掌～");
      this.updateSceneLighting();

      if (this.state.candles.every((candle) => candle.lit)) {
        this.sound.playCheer();
        this.elements.cakeCaption.textContent = "所有蜡烛都亮啦，快来许愿吹蜡烛。";
        window.setTimeout(() => this.unlockWishStage(), 260);
      }
    }

    updateSceneLighting() {
      const litCount = this.state.candles.filter((candle) => candle.lit).length;
      const total = this.state.candles.length || 1;
      const ratio = litCount / total;
      let dim = 1;

      if (this.state.stage === "lighting") {
        dim = 1 - ratio * 0.18;
      } else if (this.state.stage === "wish") {
        dim = 0.76;
      }

      document.documentElement.style.setProperty("--scene-dim", String(dim));
      this.elements.body.classList.toggle("is-dim", this.state.stage === "lighting" || this.state.stage === "wish");
    }

    unlockWishStage() {
      this.setStage("wish");
      this.sound.enterWishMode();
      this.elements.modeTag.textContent = "准备吹蜡烛";
      this.elements.statusCopy.textContent = "对准麦克风吹气，或者切换成长按吹烛模式。";
      this.elements.promptCopy.textContent = "✨ 愿望默念好了吗？对着麦克风用力吹一口气，熄灭蜡烛吧～";
      this.elements.promptModal.classList.add("is-open");
    }

    startWishByMicrophone() {
      this.sound.unlock();
      this.elements.promptModal.classList.remove("is-open");
      this.state.usingFallback = false;
      this.detector.start();
      this.elements.modeTag.textContent = "麦克风识别中";
      this.elements.statusCopy.textContent = "先采集 2 秒环境底噪，请保持安静。";
    }

    handleDetectorState(state) {
      if (this.state.stage !== "wish") {
        return;
      }

      if (state === "calibrating") {
        this.elements.statusCopy.textContent = "正在校准环境底噪，请保持安静。";
      }

      if (state === "listening") {
        this.elements.statusCopy.textContent = "对着麦克风吹气，进度条满后就会熄灭蜡烛。";
      }
    }

    enableFallbackMode(message) {
      if (this.state.stage !== "wish") {
        return;
      }

      this.state.usingFallback = true;
      this.detector.stop();
      this.elements.promptModal.classList.remove("is-open");
      this.elements.modeTag.textContent = "长按吹烛模式";
      this.elements.statusCopy.textContent = message || "长按蜡烛区域，进度条满后会熄灭蜡烛。";
      this.showToast("已切换为长按吹蜡烛模式。", true);
    }

    updateAirflow(progress, payload) {
      const value = Utils.clamp(progress || 0, 0, 1);
      this.elements.airflowFill.style.width = String(value * 100) + "%";

      if (payload && payload.calibrating) {
        this.elements.airflowFill.style.background = "linear-gradient(90deg, #ffd468 0%, #fff0aa 100%)";
        return;
      }

      if (payload && payload.likelyBlow) {
        this.elements.airflowFill.style.background = "linear-gradient(90deg, #ff8b6c 0%, #ffd468 55%, #9be59a 100%)";
        this.elements.body.classList.add("is-blowing");
        if (value < 0.72 && performance.now() - this.lastBlowHintAt > 800) {
          this.lastBlowHintAt = performance.now();
          this.elements.statusCopy.textContent = "再用力一点呀～";
          this.sound.playBlow();
        }
      } else {
        this.elements.airflowFill.style.background = "linear-gradient(90deg, #ff9d8d 0%, #ffd468 100%)";
        this.elements.body.classList.remove("is-blowing");
      }
    }

    handleBlow(payload) {
      if (this.state.stage !== "wish") {
        return;
      }

      this.sound.playOut();
      this.extinguishCandles(payload.strength > 0.9 ? 2 : 1);
    }

    extinguishCandles(count) {
      const now = performance.now();
      if (now < this.nextExtinguishAt) {
        return;
      }

      const candidates = this.state.candles.filter((candle) => candle.lit && !candle.out).sort(function (left, right) {
        if (left.type !== right.type) {
          return left.type === "digit" ? -1 : 1;
        }

        return left.blowRank - right.blowRank;
      }).slice(0, count);

      if (!candidates.length) {
        return;
      }

      candidates.forEach((candle) => {
        candle.lit = false;
        candle.out = true;
        const element = this.candleElements.get(candle.id);
        element.classList.remove("is-lit");
        element.classList.add("is-out");
      });

      this.nextExtinguishAt = now + 1000;
      this.updateSceneLighting();

      if (this.state.candles.every((candle) => !candle.lit)) {
        this.finishCeremony();
      } else {
        this.elements.statusCopy.textContent = "再来一口，就快要全部熄灭啦。";
        this.updateAirflow(0, { likelyBlow: false });
      }
    }

    finishCeremony() {
      this.detector.stop();
      this.elements.blackoutLayer.classList.add("is-active");
      this.elements.statusCopy.textContent = "白烟还在轻轻飘起，狂欢马上开始。";
      this.updateAirflow(0, { likelyBlow: false });

      window.setTimeout(() => {
        this.elements.blackoutLayer.classList.remove("is-active");
        this.setStage("celebrate");
        this.sound.startCelebrateTrack();
        this.sound.playConfetti();
        this.elements.modeTag.textContent = "狂欢时刻";
        this.elements.statusCopy.textContent = "生日歌响起来啦，派对功能已经全部解锁。";
        this.elements.cakeCaption.textContent = "蜡烛都熄灭啦，留下祝福并生成生日贺卡吧。";
        this.spawnCelebrationRain();
        this.openWishModal();
      }, 520);
    }

    resetCandles() {
      this.detector.stop();
      this.stopFallbackHold();
      this.renderCandles();
      this.sound.startAmbient();
      this.setStage("lighting");
      this.elements.promptModal.classList.remove("is-open");
      this.elements.wishModal.classList.remove("is-open");
      this.showToast("蜡烛已经重新准备好了，再点亮一次吧。", true);
    }

    handleFallbackPointerDown(event) {
      if (!this.state.usingFallback || this.state.stage !== "wish") {
        return;
      }

      if (!event.target.closest(".cake-stage, .candle")) {
        return;
      }

      event.preventDefault();
      this.sound.playBlow();
      this.fallbackHold.active = true;
      this.fallbackHold.startedAt = performance.now();

      const step = () => {
        if (!this.fallbackHold.active) {
          return;
        }

        const progress = Utils.clamp((performance.now() - this.fallbackHold.startedAt) / 900, 0, 1);
        this.updateAirflow(progress, { likelyBlow: progress > 0.2 });

        if (progress >= 1) {
          this.fallbackHold.active = false;
          this.extinguishCandles(1);
          this.updateAirflow(0, { likelyBlow: false });
          return;
        }

        this.fallbackHold.frame = requestAnimationFrame(step);
      };

      this.fallbackHold.frame = requestAnimationFrame(step);
    }

    stopFallbackHold() {
      this.fallbackHold.active = false;
      cancelAnimationFrame(this.fallbackHold.frame);
      this.fallbackHold.frame = 0;

      if (this.state.stage === "wish") {
        this.updateAirflow(0, { likelyBlow: false });
      }
    }

    updateMenuState() {
      const unlocked = this.state.stage === "celebrate";
      this.elements.menuList.querySelectorAll(".menu-button").forEach((button) => {
        button.disabled = !unlocked;
      });
      this.elements.menuLockTip.textContent = unlocked
        ? "派对功能已解锁，可以继续留言、装饰和分享。"
        : "完成吹蜡烛后会解锁全部派对功能。";
    }

    handleMenuClick(event) {
      const button = event.target.closest(".menu-button");
      if (!button) {
        return;
      }

      if (button.disabled) {
        this.showToast("先完成点亮和吹蜡烛仪式，其他派对功能才会开放。", true);
        return;
      }

      this.updateDrawerView(button.dataset.panel);
    }

    updateDrawerView(viewName) {
      this.state.panel = viewName;
      this.elements.utilityDrawer.querySelectorAll(".drawer-view").forEach((view) => {
        view.classList.toggle("is-active", view.dataset.view === viewName);
      });
    }

    async handleAvatarFile(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) {
        return;
      }

      const dataUrl = await Utils.fileToDataUrl(file);
      this.state.avatarSketch = await Utils.sketchAvatar(dataUrl, this.elements.avatarSketchCanvas, this.state.theme);
      this.elements.avatarPreview.src = this.state.avatarSketch;
      this.syncSharedState();
    }

    renderWish() {
      this.elements.wishTextarea.value = this.state.wish;
    }

    openWishModal() {
      this.elements.wishModal.classList.add("is-open");
    }

    closeWishModal() {
      this.elements.wishModal.classList.remove("is-open");
    }

    saveWish() {
      this.state.wish = this.elements.wishTextarea.value.trim();
      window.localStorage.setItem(Utils.STORAGE_KEYS.wish, this.state.wish);
      this.syncSharedState();
      this.closeWishModal();
      this.showToast("愿望已经悄悄保存在这台设备里。", true);
    }

    syncSharedState() {
      const shared = {
        n: this.state.name,
        a: this.state.age,
        t: this.state.theme,
        av: this.state.avatarSketch,
        w: this.state.wish,
      };
      const encoded = Utils.encodeHashState(shared);
      history.replaceState(null, "", encoded);
      this.updateShareLink();
    }

    updateShareLink() {
      this.elements.shareLinkOutput.value = window.location.href;
    }

    toggleMusic() {
      const enabled = this.sound.toggleMusic();
      this.elements.musicToggle.textContent = enabled ? "暂停BGM" : "播放BGM";
      if (enabled && this.state.stage !== "celebrate") {
        this.sound.startAmbient();
      }
      if (enabled && this.state.stage === "celebrate") {
        this.sound.startCelebrateTrack();
      }
    }

    switchCelebrationTrack() {
      this.sound.switchCelebrationTrack();
      this.showToast("已切换到备用庆祝音色。", true);
    }

    toggleEffects() {
      this.state.effectsEnabled = !this.state.effectsEnabled;
      this.elements.effectToggle.textContent = this.state.effectsEnabled ? "关闭特效" : "开启特效";
    }

    animateAnimal(element, message) {
      element.classList.remove("is-bouncing");
      window.requestAnimationFrame(() => {
        element.classList.add("is-bouncing");
      });
      this.sound.playAnimal();
      this.showToast(message, false);
    }

    handlePointerTrail(event) {
      if (!this.state.effectsEnabled) {
        return;
      }

      const dot = document.createElement("span");
      dot.className = "trail-dot";
      dot.style.left = String(event.clientX) + "px";
      dot.style.top = String(event.clientY) + "px";
      this.elements.floatingLayer.appendChild(dot);
      window.setTimeout(() => dot.remove(), 680);
    }

    spawnFirework(clientX, clientY) {
      if (!this.state.effectsEnabled || this.state.stage === "loading") {
        return;
      }

      for (let index = 0; index < 8; index += 1) {
        const piece = document.createElement("span");
        piece.className = "firework-piece";
        piece.style.left = String(clientX) + "px";
        piece.style.top = String(clientY) + "px";
        piece.style.setProperty("--dx", String(Utils.randomBetween(-60, 60)) + "px");
        piece.style.setProperty("--dy", String(Utils.randomBetween(-60, 60)) + "px");
        this.elements.floatingLayer.appendChild(piece);
        window.setTimeout(() => piece.remove(), 820);
      }
    }

    spawnCelebrationRain() {
      if (!this.state.effectsEnabled) {
        return;
      }

      for (let index = 0; index < 28; index += 1) {
        const piece = document.createElement("span");
        piece.className = "confetti-piece";
        piece.style.left = String(Utils.randomBetween(0, window.innerWidth)) + "px";
        piece.style.animationDelay = String(Utils.randomBetween(0, 0.8)) + "s";
        piece.style.background = ["#ff8bb3", "#ffd468", "#9edaf6", "#ffe7f0"][index % 4];
        this.elements.floatingLayer.appendChild(piece);
        window.setTimeout(() => piece.remove(), 4200);
      }
    }

    showToast(message, emphatic) {
      const toast = document.createElement("div");
      toast.className = "toast" + (emphatic ? " is-emphatic" : "");
      toast.textContent = message;
      this.elements.toastShell.appendChild(toast);
      window.setTimeout(() => toast.remove(), 1800);
    }
  }

  window.addEventListener("DOMContentLoaded", function () {
    const app = new BirthdayPartyApp();
    app.init();
  });
}());