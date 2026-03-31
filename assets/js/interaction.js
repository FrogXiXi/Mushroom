(function () {
  const Utils = window.BirthdayUtils;
  const BlowDetector = window.BlowDetection.BlowDetector;
  const SoundController = window.BlowDetection.SoundController;

  class BirthdayPartyApp {
    constructor() {
      this.elements = {
        body: document.body,
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
        cakeDecorLayer: document.getElementById("cakeDecorLayer"),
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
        cakeStyleSwitches: document.getElementById("cakeStyleSwitches"),
        decorPalette: document.getElementById("decorPalette"),
        giftGrid: document.getElementById("giftGrid"),
        dedicationForm: document.getElementById("dedicationForm"),
        dedicationName: document.getElementById("dedicationName"),
        dedicationMessage: document.getElementById("dedicationMessage"),
        dedicationCandleSelect: document.getElementById("dedicationCandleSelect"),
        dedicationList: document.getElementById("dedicationList"),
        exportWishesButton: document.getElementById("exportWishesButton"),
        clearWishesButton: document.getElementById("clearWishesButton"),
        wishList: document.getElementById("wishList"),
        cardWishSelect: document.getElementById("cardWishSelect"),
        cardCaptionInput: document.getElementById("cardCaptionInput"),
        exportSummary: document.getElementById("exportSummary"),
        exportCardButton: document.getElementById("exportCardButton"),
        eggList: document.getElementById("eggList"),
        helloKittyActor: document.getElementById("helloKittyActor"),
        floatingLayer: document.getElementById("floatingLayer"),
        candleDedicationLayer: document.getElementById("candleDedicationLayer"),
        audioLight: document.getElementById("audioLight"),
        audioBlow: document.getElementById("audioBlow"),
        audioOut: document.getElementById("audioOut"),
        audioCheer: document.getElementById("audioCheer"),
        audioBgm: document.getElementById("audioBgm"),
        audioCelebrate: document.getElementById("audioCelebrate"),
        audioAnimal: document.getElementById("audioAnimal"),
        audioConfetti: document.getElementById("audioConfetti"),
        cardTarget: document.getElementById("cardTarget"),
        memorialSnapshot: document.getElementById("memorialSnapshot"),
        snapshotTitle: document.getElementById("snapshotTitle"),
        snapshotSubtitle: document.getElementById("snapshotSubtitle"),
        snapshotAvatar: document.getElementById("snapshotAvatar"),
        snapshotCakeImage: document.getElementById("snapshotCakeImage"),
        snapshotWishText: document.getElementById("snapshotWishText"),
        snapshotDedications: document.getElementById("snapshotDedications"),
        snapshotFooter: document.getElementById("snapshotFooter"),
      };

      // 可替换素材：三套蛋糕主视觉，建议尺寸 440*300px，SVG/PNG 透明底格式。
      this.cakeStyles = {
        cream: "./assets/images/cake/cake-cream-default.svg",
        chocolate: "./assets/images/cake/cake-chocolate.svg",
        mango: "./assets/images/cake/cake-mango.svg",
      };

      this.decorCatalog = [
        { kind: "bow", label: "蝴蝶结" },
        { kind: "cherry", label: "樱桃" },
        { kind: "candy", label: "糖果" },
        { kind: "strawberry", label: "草莓" },
      ];

      this.extraDecorCatalog = [
        { kind: "heart", label: "爱心" },
        { kind: "star", label: "星星" },
      ];

      this.giftPresets = {
        bow: ["bow", "bow", "heart"],
        candy: ["candy", "candy", "star"],
        fruit: ["strawberry", "cherry", "heart"],
      };

      this.eggLabels = {
        kitty: "连续点击 Hello Kitty 5 次",
        cake: "双击蛋糕",
        blank: "长按空白处",
        name: "输入“永远可爱”",
      };

      this.state = {
        stage: "loading",
        name: "",
        age: "",
        theme: "kitty",
        avatarSketch: "",
        cakeStyle: "cream",
        candles: [],
        panel: "invite",
        usingFallback: false,
        effectsEnabled: true,
        performanceReduced: false,
        wish: window.localStorage.getItem(Utils.STORAGE_KEYS.wish) || "",
        wishes: Utils.loadFromLocal(Utils.STORAGE_KEYS.wishes, []),
        dedications: Utils.loadFromLocal(Utils.STORAGE_KEYS.dedications, []),
        selectedWishId: "",
        cardCaption: "",
        eggs: Utils.loadFromLocal(Utils.STORAGE_KEYS.eggs, {
          kitty: false,
          cake: false,
          blank: false,
          name: false,
        }),
        decorations: [],
      };

      this.candleElements = new Map();
      this.nextExtinguishAt = 0;
      this.fallbackHold = { active: false, startedAt: 0, frame: 0 };
      this.kittyCombo = { count: 0, time: 0 };
      this.blankHoldTimer = 0;
      this.activeDecorationId = null;
      this.lastBlowHintAt = 0;
      this.cardRendererPromise = null;
      this.lastDialogTrigger = null;

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
      this.ensureWishSelection();
      this.applyThemeClass();
      this.renderTitle();
      this.renderCakeStyle();
      this.renderCandles();
      this.renderDecorPalette();
      this.renderDecorations();
      this.renderWish();
      this.renderWishVault();
      this.renderDedicationList();
      this.renderCardWishOptions();
      this.updateExportSummary();
      this.renderEggList();
      this.updateDrawerView(this.state.panel);
      this.updateMenuState();
      this.monitorPerformance();

      window.setTimeout(() => {
        this.setStage("customize");
      }, 1400);
    }

    bindEvents() {
      this.elements.customizeForm.addEventListener("submit", (event) => this.handleCustomizeSubmit(event));
      this.elements.themeSwitcher.addEventListener("click", (event) => this.handleThemeSelection(event));
      this.elements.avatarUploadButton.addEventListener("click", () => this.elements.avatarFileInput.click());
      this.elements.avatarFileInput.addEventListener("change", (event) => this.handleAvatarFile(event));
      this.elements.nameInput.addEventListener("input", () => this.handleNameEgg());
      this.elements.startMicButton.addEventListener("click", () => this.startWishByMicrophone());
      this.elements.forceFallbackButton.addEventListener("click", () => this.enableFallbackMode("已切换到长按吹烛模式，长按蛋糕上的蜡烛区域即可吹灭。"));
      this.elements.resetCandlesButton.addEventListener("click", () => this.resetCandles());
      this.elements.fallbackModeButton.addEventListener("click", () => this.enableFallbackMode("已切换到长按吹烛模式，长按蛋糕上的蜡烛区域即可吹灭。"));
      this.elements.musicToggle.addEventListener("click", () => this.toggleMusic());
      this.elements.trackToggle.addEventListener("click", () => this.switchCelebrationTrack());
      this.elements.effectToggle.addEventListener("click", () => this.toggleEffects());
      this.elements.saveCardButton.addEventListener("click", () => this.generateCard());
      this.elements.saveWishButton.addEventListener("click", () => this.saveWish());
      this.elements.closeWishButton.addEventListener("click", () => this.closeWishModal());
      this.elements.menuList.addEventListener("click", (event) => this.handleMenuClick(event));
      this.elements.cakeStyleSwitches.addEventListener("click", (event) => this.handleCakeStyleSwitch(event));
      this.elements.decorPalette.addEventListener("click", (event) => this.handleDecorPaletteClick(event));
      this.elements.dedicationForm.addEventListener("submit", (event) => this.handleDedicationSubmit(event));
      this.elements.wishList.addEventListener("click", (event) => this.handleWishListClick(event));
      this.elements.exportWishesButton.addEventListener("click", () => this.exportWishesAsText());
      this.elements.clearWishesButton.addEventListener("click", () => this.clearAllWishes());
      this.elements.cardWishSelect.addEventListener("change", (event) => this.handleWishSelectionChange(event));
      this.elements.cardCaptionInput.addEventListener("input", (event) => this.handleCardCaptionInput(event));
      this.elements.exportCardButton.addEventListener("click", () => this.generateCard());
      this.elements.helloKittyActor.addEventListener("click", () => this.handleKittyTap());
      document.addEventListener("keydown", (event) => this.handleGlobalKeydown(event));

      document.querySelectorAll(".animal-card, .pet-preview").forEach((button) => {
        button.addEventListener("click", () => this.animateAnimal(button));
      });

      this.elements.cakeStage.addEventListener("pointerdown", (event) => this.handleCakePointerDown(event));
      this.elements.cakeStage.addEventListener("dblclick", () => this.unlockEgg("cake", "双击蛋糕彩蛋触发啦，糖果雨正在掉落。", true));
      window.addEventListener("pointermove", (event) => this.handlePointerMove(event));
      window.addEventListener("pointerup", () => this.handlePointerUp());
      window.addEventListener("pointercancel", () => this.handlePointerUp());
      window.addEventListener("pointerdown", (event) => this.handleBlankHoldStart(event));
      window.addEventListener("pointerup", () => this.cancelBlankHold());
      window.addEventListener("pointercancel", () => this.cancelBlankHold());
      window.addEventListener("pointermove", (event) => this.handlePointerTrail(event));
      window.addEventListener("click", (event) => this.spawnFirework(event.clientX, event.clientY));
    }

    restoreSharedState() {
      const profile = Utils.loadFromLocal(Utils.STORAGE_KEYS.profile, null);
      const shared = profile || Utils.decodeHashState(window.location.hash);
      if (!shared) {
        return;
      }

      this.state.name = Utils.sanitizeName(shared.n || "");
      this.state.age = String(shared.a || "");
      this.state.theme = shared.t || "kitty";
      this.state.avatarSketch = shared.av || "";
      this.state.wish = shared.w || this.state.wish;
      this.state.wishes = Array.isArray(shared.ws) ? shared.ws.slice(0, 24) : this.state.wishes;
      this.state.dedications = Array.isArray(shared.dd) ? shared.dd.slice(0, 16) : this.state.dedications;
      this.state.selectedWishId = shared.sw || this.state.selectedWishId;
      this.state.cardCaption = shared.cc || this.state.cardCaption;
      this.state.cakeStyle = shared.cs || "cream";
      this.state.decorations = Array.isArray(shared.d) ? shared.d.slice(0, 24) : [];
      this.state.eggs = Object.assign({}, this.state.eggs, shared.eg || {});

      this.elements.nameInput.value = this.state.name;
      this.elements.ageInput.value = this.state.age;

      if (this.state.avatarSketch) {
        this.elements.avatarPreview.src = this.state.avatarSketch;
      }

      if (this.state.cardCaption) {
        this.elements.cardCaptionInput.value = this.state.cardCaption;
      }

      if (!profile && window.location.hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }

    syncSharedState() {
      Utils.saveToLocal(Utils.STORAGE_KEYS.profile, {
        n: this.state.name,
        a: this.state.age,
        t: this.state.theme,
        av: this.state.avatarSketch,
        w: this.state.wish,
        ws: this.state.wishes,
        dd: this.state.dedications,
        sw: this.state.selectedWishId,
        cc: this.state.cardCaption,
        cs: this.state.cakeStyle,
        d: this.state.decorations,
        eg: this.state.eggs,
      });
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
        ? "祝" + this.state.name + "<br>生日快乐"
        : "生日快乐！<br>留住今天";

      this.elements.heroSubtitle.textContent = this.state.name
        ? "把愿望、名字和蜡烛都留给" + this.state.name + "，做成今天独一份的生日纪念。"
        : "一边点亮蜡烛，一边把今天的愿望悄悄留下来。";
    }

    handleNameEgg() {
      if (Utils.sanitizeName(this.elements.nameInput.value) === "永远可爱") {
        this.unlockEgg("name", "限定装饰彩蛋已经解锁，蛋糕 DIY 面板里会出现额外素材。", false);
      }
    }

    handleKittyTap() {
      const now = performance.now();
      this.kittyCombo.count = now - this.kittyCombo.time < 1600 ? this.kittyCombo.count + 1 : 1;
      this.kittyCombo.time = now;
      this.animateAnimal(this.elements.helloKittyActor, "Hello Kitty在给你打气～");

      if (this.kittyCombo.count >= 5) {
        this.kittyCombo.count = 0;
        this.unlockEgg("kitty", "Hello Kitty 专属舞蹈彩蛋触发啦。", true);
      }
    }

    buildCandles() {
      const candles = [];
      const positions = [18, 33, 50, 67, 82];
      const colors = ["pink", "blue", "pink", "yellow", "mint"];
      const lightingOrder = [2, 1, 3, 0, 4];

      positions.forEach((position, index) => {
        candles.push({
          id: "base-" + index,
          label: "第" + (index + 1) + "支蜡烛",
          type: "standard",
          x: position,
          y: 68,
          color: colors[index],
          lightRank: lightingOrder.indexOf(index) + 4,
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
            label: "数字蜡烛 " + digit,
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
      this.renderDedicationOptions();
      this.renderCandleDedications();
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
      this.elements.promptModal.setAttribute("aria-hidden", "false");
      this.elements.promptModal.classList.add("is-open");
    }

    startWishByMicrophone() {
      this.sound.unlock();
      this.elements.promptModal.setAttribute("aria-hidden", "true");
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
      this.elements.promptModal.setAttribute("aria-hidden", "true");
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
      this.stopFallbackHold();
      this.elements.blackoutLayer.classList.add("is-active");
      this.elements.statusCopy.textContent = "白烟还在轻轻飘起，狂欢马上开始。";
      this.updateAirflow(0, { likelyBlow: false });

      window.setTimeout(() => {
        this.elements.blackoutLayer.classList.remove("is-active");
        this.setStage("celebrate");
        this.sound.startCelebrateTrack();
        this.sound.playConfetti();
        this.updateDrawerView("guestbook");
        this.elements.modeTag.textContent = "纪念时刻";
        this.elements.statusCopy.textContent = "现在可以保存愿望、点名献灯，并把今天导出成一张纪念卡。";
        this.elements.cakeCaption.textContent = "蜡烛都熄灭啦，把名字和愿望一起留在今天的纪念里吧。";
        this.spawnCelebrationRain();
        this.renderCandleDedications();
        this.openWishModal();
      }, 520);
    }

    resetCandles() {
      this.detector.stop();
      this.stopFallbackHold();
      this.renderCandles();
      this.sound.startAmbient();
      this.setStage("lighting");
      this.elements.promptModal.setAttribute("aria-hidden", "true");
      this.elements.promptModal.classList.remove("is-open");
      this.elements.wishModal.setAttribute("aria-hidden", "true");
      this.elements.wishModal.classList.remove("is-open");
      this.showToast("蜡烛已经重新准备好了，再点亮一次吧。", true);
    }

    handleCakePointerDown(event) {
      const decorItem = event.target.closest(".cake-decor-item");
      if (decorItem && this.state.stage === "celebrate") {
        event.preventDefault();
        this.activeDecorationId = decorItem.dataset.decorId;
        return;
      }

      if (this.state.usingFallback && this.state.stage === "wish") {
        this.startFallbackHold(event);
      }
    }

    startFallbackHold(event) {
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

    handlePointerMove(event) {
      if (this.activeDecorationId && this.state.stage === "celebrate") {
        const point = Utils.normalizePosition(event.clientX, event.clientY, this.elements.cakeStage);
        const decoration = this.state.decorations.find((item) => item.id === this.activeDecorationId);
        if (!decoration) {
          return;
        }

        decoration.x = point.x;
        decoration.y = point.y;
        this.renderDecorations();
      }
    }

    handlePointerUp() {
      if (this.activeDecorationId) {
        this.activeDecorationId = null;
        this.syncSharedState();
      }

      this.stopFallbackHold();
    }

    updateMenuState() {
      const unlocked = this.state.stage === "celebrate";
      this.elements.menuList.querySelectorAll(".menu-button").forEach((button) => {
        button.disabled = !unlocked;
      });
      this.elements.saveCardButton.disabled = !unlocked;
      this.elements.menuLockTip.textContent = unlocked
        ? "纪念功能已解锁，可以继续装饰、献灯、保存愿望和导出图片。"
        : "吹灭蜡烛后会解锁全部纪念功能。";
    }

    handleMenuClick(event) {
      const button = event.target.closest(".menu-button");
      if (!button) {
        return;
      }

      if (button.disabled) {
        this.showToast("先完成点亮和吹蜡烛仪式，纪念功能才会开放。", true);
        return;
      }

      this.updateDrawerView(button.dataset.panel);
    }

    updateDrawerView(viewName) {
      this.state.panel = viewName;
      this.elements.menuList.querySelectorAll(".menu-button").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.panel === viewName);
      });
      this.elements.utilityDrawer.querySelectorAll(".drawer-view").forEach((view) => {
        view.classList.toggle("is-active", view.dataset.view === viewName);
      });
    }

    ensureWishSelection() {
      if (this.state.selectedWishId && this.state.wishes.some((item) => item.id === this.state.selectedWishId)) {
        return;
      }

      this.state.selectedWishId = this.state.wishes[0] ? this.state.wishes[0].id : "";
    }

    getSelectedWish() {
      this.ensureWishSelection();
      return this.state.wishes.find((item) => item.id === this.state.selectedWishId) || null;
    }

    formatDateLabel(value) {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return "刚刚";
      }

      return date.toLocaleString("zh-CN", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    renderCakeStyle() {
      this.elements.cakeBaseImage.src = this.cakeStyles[this.state.cakeStyle] || this.cakeStyles.cream;
      this.elements.cakeStyleSwitches.querySelectorAll("button").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.style === this.state.cakeStyle);
      });
    }

    handleCakeStyleSwitch(event) {
      const button = event.target.closest("button[data-style]");
      if (!button) {
        return;
      }

      this.state.cakeStyle = button.dataset.style;
      this.renderCakeStyle();
      this.syncSharedState();
    }

    renderDecorPalette() {
      const items = this.state.eggs.name ? this.decorCatalog.concat(this.extraDecorCatalog) : this.decorCatalog;
      this.elements.decorPalette.innerHTML = "";

      items.forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "rough-button decor-token";
        button.dataset.kind = item.kind;
        button.textContent = item.label;
        this.elements.decorPalette.appendChild(button);
      });
    }

    handleDecorPaletteClick(event) {
      const button = event.target.closest("button[data-kind]");
      if (!button) {
        return;
      }

      if (this.state.stage !== "celebrate") {
        this.showToast("蛋糕 DIY 会在吹完蜡烛后解锁。", true);
        return;
      }

      this.addDecoration(button.dataset.kind);
    }

    addDecoration(kind) {
      this.state.decorations.push({
        id: Utils.uid("decor"),
        kind: kind,
        x: Utils.randomBetween(0.24, 0.76),
        y: Utils.randomBetween(0.34, 0.78),
      });
      this.renderDecorations();
      this.syncSharedState();
    }

    renderDecorations() {
      this.elements.cakeDecorLayer.innerHTML = "";

      this.state.decorations.forEach((item) => {
        const node = document.createElement("button");
        node.type = "button";
        node.className = "cake-decor-item decor-" + item.kind;
        node.dataset.decorId = item.id;
        node.style.left = String(item.x * 100) + "%";
        node.style.top = String(item.y * 100) + "%";
        node.innerHTML = "<span></span>";
        this.elements.cakeDecorLayer.appendChild(node);
      });
    }

    renderDedicationOptions() {
      const select = this.elements.dedicationCandleSelect;
      const current = select.value;
      select.innerHTML = "";

      this.state.candles.forEach((candle) => {
        const option = document.createElement("option");
        option.value = candle.id;
        option.textContent = candle.label;
        select.appendChild(option);
      });

      if (this.state.candles.length) {
        select.value = this.state.candles.some((item) => item.id === current)
          ? current
          : this.state.candles[0].id;
      }
    }

    handleDedicationSubmit(event) {
      event.preventDefault();

      if (this.state.stage !== "celebrate") {
        this.showToast("吹灭蜡烛后才能保存献灯。", true);
        return;
      }

      const name = Utils.sanitizeName(this.elements.dedicationName.value);
      const message = (this.elements.dedicationMessage.value || "").trim().slice(0, 40);
      const candleId = this.elements.dedicationCandleSelect.value;
      const candle = this.state.candles.find((item) => item.id === candleId);

      if (!name) {
        this.showToast("先写一个献灯名字。", true);
        return;
      }

      if (!candle) {
        this.showToast("请选择要点名的蜡烛。", true);
        return;
      }

      const record = {
        id: Utils.uid("dedication"),
        candleId: candle.id,
        candleLabel: candle.label,
        name: name,
        message: message,
        createdAt: new Date().toISOString(),
      };

      const existingIndex = this.state.dedications.findIndex((item) => item.candleId === candle.id);
      if (existingIndex >= 0) {
        this.state.dedications.splice(existingIndex, 1, record);
      } else {
        this.state.dedications.unshift(record);
      }

      this.state.dedications = this.state.dedications.slice(0, 16);
      Utils.saveToLocal(Utils.STORAGE_KEYS.dedications, this.state.dedications);
      this.syncSharedState();
      this.renderDedicationList();
      this.renderCandleDedications();
      this.updateExportSummary();
      this.elements.dedicationName.value = "";
      this.elements.dedicationMessage.value = "";
      this.showToast("这支蜡烛已经写上名字啦。", true);
    }

    renderDedicationList() {
      this.elements.dedicationList.innerHTML = "";

      if (!this.state.dedications.length) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "还没有献灯记录，等吹灭蜡烛后为某一支蜡烛写上名字吧。";
        this.elements.dedicationList.appendChild(empty);
        return;
      }

      this.state.dedications.forEach((item) => {
        const card = document.createElement("article");
        card.className = "dedication-card";

        const title = document.createElement("strong");
        title.textContent = item.name + " · " + item.candleLabel;

        const copy = document.createElement("p");
        copy.textContent = item.message || "把温柔和祝福轻轻留在这里。";

        const meta = document.createElement("p");
        meta.className = "wish-meta";
        meta.textContent = this.formatDateLabel(item.createdAt);

        card.appendChild(title);
        card.appendChild(copy);
        card.appendChild(meta);
        this.elements.dedicationList.appendChild(card);
      });
    }

    renderCandleDedications() {
      this.elements.candleDedicationLayer.innerHTML = "";

      if (this.state.stage !== "celebrate") {
        return;
      }

      this.state.dedications.forEach((item) => {
        const candle = this.state.candles.find((entry) => entry.id === item.candleId);
        if (!candle) {
          return;
        }

        const tag = document.createElement("button");
        tag.type = "button";
        tag.className = "candle-name-tag";
        tag.style.left = candle.x + "%";
        tag.style.top = Math.max(10, candle.y - 18) + "%";
        tag.textContent = item.name;
        tag.addEventListener("click", () => {
          const extra = item.message ? "，" + item.message : "。";
          this.showToast(item.name + "把心意留给了" + item.candleLabel + extra, true);
        });
        this.elements.candleDedicationLayer.appendChild(tag);
      });
    }

    renderWishVault() {
      this.elements.wishList.innerHTML = "";
      this.ensureWishSelection();

      if (!this.state.wishes.length) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "还没有保存愿望。吹灭蜡烛后，把第一条愿望写下来吧。";
        this.elements.wishList.appendChild(empty);
        return;
      }

      this.state.wishes.forEach((item) => {
        const card = document.createElement("article");
        card.className = "wish-card" + (item.id === this.state.selectedWishId ? " is-selected" : "");

        const title = document.createElement("strong");
        title.textContent = item.message;

        const meta = document.createElement("p");
        meta.className = "wish-meta";
        meta.textContent = this.formatDateLabel(item.createdAt);

        const actions = document.createElement("div");
        actions.className = "wish-card-actions";

        const selectButton = document.createElement("button");
        selectButton.type = "button";
        selectButton.className = "rough-button";
        selectButton.dataset.action = "select-wish";
        selectButton.dataset.wishId = item.id;
        selectButton.textContent = item.id === this.state.selectedWishId ? "已用于纪念卡" : "设为纪念卡内容";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "rough-button";
        deleteButton.dataset.action = "delete-wish";
        deleteButton.dataset.wishId = item.id;
        deleteButton.textContent = "删除";

        actions.appendChild(selectButton);
        actions.appendChild(deleteButton);
        card.appendChild(title);
        card.appendChild(meta);
        card.appendChild(actions);
        this.elements.wishList.appendChild(card);
      });
    }

    handleWishListClick(event) {
      const button = event.target.closest("button[data-action]");
      if (!button) {
        return;
      }

      const wishId = button.dataset.wishId;
      if (button.dataset.action === "select-wish") {
        this.state.selectedWishId = wishId;
        this.renderWishVault();
        this.renderCardWishOptions();
        this.updateExportSummary();
        this.syncSharedState();
        this.showToast("这条愿望已设为纪念卡主内容。", true);
      }

      if (button.dataset.action === "delete-wish") {
        this.state.wishes = this.state.wishes.filter((item) => item.id !== wishId);
        Utils.saveToLocal(Utils.STORAGE_KEYS.wishes, this.state.wishes);
        this.ensureWishSelection();
        this.syncSharedState();
        this.renderWishVault();
        this.renderCardWishOptions();
        this.updateExportSummary();
        this.showToast("这条愿望已经从本地移除了。", true);
      }
    }

    clearAllWishes() {
      if (!this.state.wishes.length) {
        this.showToast("当前还没有本地愿望可清空。", true);
        return;
      }

      if (!window.confirm("确认清空当前浏览器里的全部愿望吗？此操作无法撤销。")) {
        return;
      }

      this.state.wishes = [];
      this.state.selectedWishId = "";
      this.state.wish = "";
      window.localStorage.removeItem(Utils.STORAGE_KEYS.wish);
      Utils.saveToLocal(Utils.STORAGE_KEYS.wishes, this.state.wishes);
      this.syncSharedState();
      this.renderWish();
      this.renderWishVault();
      this.renderCardWishOptions();
      this.updateExportSummary();
      this.showToast("本地愿望已经清空。", true);
    }

    exportWishesAsText() {
      if (!this.state.wishes.length) {
        this.showToast("先保存至少一条愿望，再导出文本。", true);
        return;
      }

      const text = this.state.wishes.map((item, index) => {
        return [
          "愿望 " + String(index + 1),
          "时间：" + this.formatDateLabel(item.createdAt),
          "内容：" + item.message,
        ].join("\n");
      }).join("\n\n");

      Utils.downloadTextFile((this.state.name || "生日纪念") + "-愿望.txt", text, "text/plain;charset=utf-8");
      this.showToast("愿望文本已经导出到本地。", true);
    }

    handleWishSelectionChange(event) {
      this.state.selectedWishId = event.target.value;
      this.renderWishVault();
      this.updateExportSummary();
      this.syncSharedState();
    }

    handleCardCaptionInput(event) {
      this.state.cardCaption = (event.target.value || "").trim();
      this.updateExportSummary();
      this.syncSharedState();
    }

    renderCardWishOptions() {
      const select = this.elements.cardWishSelect;
      this.ensureWishSelection();
      select.innerHTML = "";

      if (!this.state.wishes.length) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "暂无愿望，请先保存";
        select.appendChild(option);
        return;
      }

      this.state.wishes.forEach((item, index) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = "愿望 " + String(index + 1) + " · " + item.message.slice(0, 18);
        select.appendChild(option);
      });

      select.value = this.state.selectedWishId;
    }

    updateExportSummary() {
      const wish = this.getSelectedWish();
      const lines = [];
      lines.push("将导出当前主题、头像、蛋糕样式和献灯名单。");
      lines.push(wish ? "纪念卡愿望：" + wish.message : "纪念卡愿望：还没有选择，请先保存一条愿望。");
      lines.push("献灯数量：" + String(this.state.dedications.length) + " 条");
      if (this.state.cardCaption) {
        lines.push("纪念题字：" + this.state.cardCaption);
      }

      this.elements.exportSummary.innerHTML = "";
      lines.forEach((line) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = line;
        this.elements.exportSummary.appendChild(paragraph);
      });
    }

    renderWish() {
      this.elements.wishTextarea.value = this.state.wish;
    }

    openWishModal() {
      this.lastDialogTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      this.renderWish();
      this.elements.wishModal.setAttribute("aria-hidden", "false");
      this.elements.wishModal.classList.add("is-open");
      window.setTimeout(() => this.elements.wishTextarea.focus(), 40);
    }

    closeWishModal() {
      this.elements.wishModal.setAttribute("aria-hidden", "true");
      this.elements.wishModal.classList.remove("is-open");
      if (this.lastDialogTrigger) {
        this.lastDialogTrigger.focus();
      }
    }

    saveWish() {
      const message = this.elements.wishTextarea.value.trim();
      if (!message) {
        this.showToast("先写下一句愿望再保存。", true);
        return;
      }

      const record = {
        id: Utils.uid("wish"),
        message: message,
        createdAt: new Date().toISOString(),
      };

      this.state.wish = message;
      this.state.wishes.unshift(record);
      this.state.wishes = this.state.wishes.slice(0, 24);
      this.state.selectedWishId = record.id;
      window.localStorage.setItem(Utils.STORAGE_KEYS.wish, this.state.wish);
      Utils.saveToLocal(Utils.STORAGE_KEYS.wishes, this.state.wishes);
      this.syncSharedState();
      this.renderWish();
      this.renderWishVault();
      this.renderCardWishOptions();
      this.updateExportSummary();
      this.closeWishModal();
      this.updateDrawerView("guestbook");
      this.showToast("愿望已经悄悄保存在这台设备里。", true);
    }

    handleGlobalKeydown(event) {
      if (event.key !== "Escape") {
        return;
      }

      if (this.elements.wishModal.classList.contains("is-open")) {
        event.preventDefault();
        this.closeWishModal();
      }

      if (this.elements.promptModal.classList.contains("is-open")) {
        event.preventDefault();
        this.enableFallbackMode("已切换到长按吹烛模式，长按蜡烛区域即可吹灭。");
      }
    }

    renderEggList() {
      this.elements.eggList.querySelectorAll("li").forEach((item) => {
        const key = item.dataset.egg;
        const unlocked = Boolean(this.state.eggs[key]);
        item.classList.toggle("is-done", unlocked);
        item.textContent = this.eggLabels[key] + (unlocked ? "：已解锁" : "：待解锁");
      });
    }

    unlockEgg(key, message, celebrate) {
      if (this.state.eggs[key]) {
        return;
      }

      this.state.eggs[key] = true;
      Utils.saveToLocal(Utils.STORAGE_KEYS.eggs, this.state.eggs);
      this.renderEggList();
      this.renderDecorPalette();
      this.syncSharedState();
      this.showToast(message, true);

      if (celebrate) {
        this.elements.helloKittyActor.classList.add("is-dancing");
        window.setTimeout(() => this.elements.helloKittyActor.classList.remove("is-dancing"), 1400);
        this.spawnCelebrationRain();
      }
    }

    animateAnimal(element, message) {
      const animal = element.dataset.animal || "friend";
      const messages = {
        kitty: "Hello Kitty在给你打气～",
        bear: "小熊举起了生日手牌～",
        puppy: "小狗已经兴奋地开始摇尾巴啦～",
        cat: "小猫正歪着头等你继续点蜡烛。",
        bunny: "小兔在原地蹦了两下，超期待许愿时刻。",
      };

      element.classList.remove("is-bouncing");
      window.requestAnimationFrame(() => {
        element.classList.add("is-bouncing");
      });
      this.sound.playAnimal();
      this.showToast(message || messages[animal] || "小伙伴在为你欢呼。", false);
    }

    handleBlankHoldStart(event) {
      const interactive = event.target.closest("button, input, textarea, .candle, .cake-stage, .rough-button");
      if (interactive) {
        return;
      }

      this.blankHoldTimer = window.setTimeout(() => {
        this.unlockEgg("blank", "长按空白处彩蛋触发，掌声和爱心一起落下来啦。", true);
      }, 900);
    }

    cancelBlankHold() {
      window.clearTimeout(this.blankHoldTimer);
      this.blankHoldTimer = 0;
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

    toggleMusic() {
      const enabled = this.sound.toggleMusic();
      this.elements.musicToggle.textContent = enabled ? "暂停音乐" : "播放音乐";

      if (enabled && this.state.stage === "celebrate") {
        this.sound.startCelebrateTrack();
      }

      if (enabled && this.state.stage !== "celebrate") {
        this.sound.startAmbient();
      }
    }

    switchCelebrationTrack() {
      this.sound.switchCelebrationTrack();
      this.showToast("已切换到另一段生日音乐。", true);
    }

    toggleEffects() {
      this.state.effectsEnabled = !this.state.effectsEnabled;
      this.elements.effectToggle.textContent = this.state.effectsEnabled ? "关闭特效" : "开启特效";
    }

    handlePointerTrail(event) {
      if (!this.state.effectsEnabled || this.state.performanceReduced) {
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
      if (!this.state.effectsEnabled || this.state.performanceReduced || this.state.stage === "loading") {
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

    spawnCelebrationRain(colors) {
      if (!this.state.effectsEnabled || this.state.performanceReduced) {
        return;
      }

      const palette = colors || ["#ff8bb3", "#ffd468", "#9edaf6", "#ffe7f0"];
      for (let index = 0; index < 28; index += 1) {
        const piece = document.createElement("span");
        piece.className = "confetti-piece";
        piece.style.left = String(Utils.randomBetween(0, window.innerWidth)) + "px";
        piece.style.animationDelay = String(Utils.randomBetween(0, 0.8)) + "s";
        piece.style.background = palette[index % palette.length];
        this.elements.floatingLayer.appendChild(piece);
        window.setTimeout(() => piece.remove(), 4200);
      }
    }

    ensureCardRenderer() {
      if (window.html2canvas) {
        return Promise.resolve(window.html2canvas);
      }

      if (this.cardRendererPromise) {
        return this.cardRendererPromise;
      }

      this.cardRendererPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
        script.async = true;
        script.onload = () => resolve(window.html2canvas);
        script.onerror = () => {
          this.cardRendererPromise = null;
          reject(new Error("html2canvas load failed"));
        };
        document.head.appendChild(script);
      });

      return this.cardRendererPromise;
    }

    prepareSnapshot() {
      const wish = this.getSelectedWish();
      const snapshotDate = new Date().toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      this.elements.snapshotTitle.textContent = this.state.name
        ? "给" + this.state.name + "的生日纪念"
        : "给最重要的人";
      this.elements.snapshotSubtitle.textContent = this.state.cardCaption
        || (this.state.name ? "愿" + this.state.name + "今天被很多很多爱围住。" : "把今天的欢笑、蜡烛和愿望留成一张图片。");
      this.elements.snapshotAvatar.src = this.state.avatarSketch || this.elements.avatarPreview.src;
      this.elements.snapshotCakeImage.src = this.elements.cakeBaseImage.src;
      this.elements.snapshotWishText.textContent = wish
        ? wish.message
        : (this.state.wish || "愿所有喜欢都被温柔接住。");
      this.elements.snapshotDedications.innerHTML = "";

      const list = this.state.dedications.length ? this.state.dedications.slice(0, 4) : [{
        name: "今天的蜡烛",
        message: "还没有点名献灯，但这份心意已经留在这里。",
      }];

      list.forEach((item) => {
        const chip = document.createElement("div");
        chip.className = "snapshot-chip";

        const title = document.createElement("strong");
        title.textContent = item.name;

        const message = document.createElement("p");
        message.textContent = item.message || item.candleLabel || "把祝福轻轻留在今天。";

        chip.appendChild(title);
        chip.appendChild(message);
        this.elements.snapshotDedications.appendChild(chip);
      });

      this.elements.snapshotFooter.textContent = snapshotDate + " · 本地浏览器生成的纪念卡";
    }

    async generateCard() {
      if (!this.getSelectedWish() && !this.state.wish) {
        this.updateDrawerView("guestbook");
        this.showToast("先保存一条愿望，再生成纪念卡。", true);
        return;
      }

      try {
        const renderer = await this.ensureCardRenderer();
        this.prepareSnapshot();
        this.elements.body.classList.add("is-exporting");
        await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));

        const canvas = await renderer(this.elements.memorialSnapshot, {
          scale: Math.min(3, Math.max(2, window.devicePixelRatio || 1)),
          backgroundColor: "#fff7ed",
          useCORS: true,
        });
        Utils.downloadDataUrl((this.state.name || "生日纪念") + "-纪念卡.png", canvas.toDataURL("image/png"));
        this.showToast("纪念卡已经生成并开始下载。", true);
      } catch (error) {
        this.showToast("纪念卡生成失败了，请稍后重试。", true);
      } finally {
        this.elements.body.classList.remove("is-exporting");
      }
    }

    monitorPerformance() {
      let frames = 0;
      let start = performance.now();

      const sample = () => {
        frames += 1;
        const now = performance.now();
        const elapsed = now - start;

        if (elapsed > 2000) {
          const fps = frames / (elapsed / 1000);
          if (fps < 42 && !this.state.performanceReduced) {
            this.state.performanceReduced = true;
            this.state.effectsEnabled = false;
            this.elements.body.classList.add("reduce-motion");
            this.elements.effectToggle.textContent = "开启特效";
            this.showToast("检测到设备性能偏低，已自动简化特效。", true);
            return;
          }

          frames = 0;
          start = now;
        }

        requestAnimationFrame(sample);
      };

      requestAnimationFrame(sample);
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