/**
 * 主应用入口 - 模块管理与全局状态
 */
const App = {
  getDefaultState() {
    return {
      stateVersion: CONFIG.stateVersion,
      cakeType: 'single',
      creamColor: CONFIG.creamColors[0],
      paintStrokes: [],
      creamStrokes: [],
      decorations: [],
      magicCardRevealed: false,
      albumReminderPending: false,
      editorSettings: {
        color: CONFIG.editorColors[1],
        opacity: 0.9,
        size: 12,
        creamSize: 24,
      },
      lastModule: 'mod-cover',
    };
  },

  // 全局状态
  state: {},

  // 模块映射
  modules: {
    'mod-cover': CoverModule,
    'mod-cake-select': CakeSelectModule,
    'mod-cream-making': CreamMakingModule,
    'mod-cream-paint': CreamPaintModule,
    'mod-decorate': DecorateModule,
    'mod-screenshot': ScreenshotModule,
    'mod-ceremony': CeremonyModule,
    'mod-cake-cut': CakeCutModule,
    'mod-ending': EndingModule,
  },

  currentModule: 'mod-cover',

  serializeState() {
    return {
      ...this.state,
      decorations: (this.state.decorations || []).map(({ img, ...rest }) => rest),
    };
  },

  saveState() {
    try {
      localStorage.setItem('zzhappy-state', JSON.stringify(this.serializeState()));
    } catch (error) {
      console.warn('save state failed', error);
    }
  },

  normalizeState(state) {
    const normalizedLastModule = state.lastModule === 'mod-cream-paint'
      ? 'mod-decorate'
      : state.lastModule;

    // Build set of valid decoration sources from config
    const validSrcs = new Set();
    Object.values(CONFIG.decorations).forEach((category) => {
      category.forEach((item) => validSrcs.add(item.src));
    });

    // Always rehydrate creamColor from config so new mapping fields stay完整
    const storedCreamId = state.creamColor?.id;
    const creamColor = CONFIG.creamColors.find((item) => item.id === storedCreamId || item.legacyIds?.includes(storedCreamId))
      || CONFIG.creamColors[0];

    return {
      ...state,
      stateVersion: CONFIG.stateVersion,
      lastModule: normalizedLastModule,
      creamColor,
      paintStrokes: (state.paintStrokes || []).map((stroke) => ({
        ...stroke,
        points: (stroke.points || []).map((point) => Utils.normalizeStoredPoint(point)),
      })),
      creamStrokes: (state.creamStrokes || []).map((stroke) => ({
        ...stroke,
        points: (stroke.points || []).map((point) => Utils.normalizeStoredPoint(point)),
      })),
      decorations: (state.decorations || []).map((item) => {
        if (typeof item.nx === 'number' && typeof item.ny === 'number') {
          return item;
        }
        const position = Utils.getDecorationPosition(item, { x: 0, y: 0, width: 1, height: 1 });
        return {
          ...item,
          nx: position.x,
          ny: position.y,
        };
      }).filter((item) => validSrcs.has(item.src)),
    };
  },

  loadState() {
    this.state = this.getDefaultState();
    try {
      const raw = localStorage.getItem('zzhappy-state');
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed.stateVersion !== CONFIG.stateVersion) {
        this.resetState();
        return;
      }
      this.state = {
        ...this.state,
        ...parsed,
        editorSettings: {
          ...this.state.editorSettings,
          ...(parsed.editorSettings || {}),
        },
      };
      this.state = this.normalizeState(this.state);
    } catch (error) {
      console.warn('load state failed', error);
    }
  },

  resetState() {
    this.state = this.getDefaultState();
    this.saveState();
  },

  hasDraftCake() {
    const serialized = this.serializeState();
    const defaults = this.getDefaultState();
    return serialized.lastModule !== defaults.lastModule
      || serialized.cakeType !== defaults.cakeType
      || serialized.creamColor?.id !== defaults.creamColor.id
      || (serialized.paintStrokes || []).length > 0
      || (serialized.creamStrokes || []).length > 0
      || (serialized.decorations || []).length > 0
      || serialized.magicCardRevealed !== defaults.magicCardRevealed
      || serialized.albumReminderPending !== defaults.albumReminderPending;
  },

  restartCreation() {
    const message = this.hasDraftCake()
      ? '要清空当前还没做完的蛋糕，重头开始吗？已保存到相册的照片不会删除。'
      : '要回到开头重新制作蛋糕吗？';

    if (typeof window !== 'undefined' && !window.confirm(message)) {
      return;
    }

    this.resetState();
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  },

  updateGlobalActionButtons() {
    const restartBtn = document.getElementById('global-restart-btn');
    if (!restartBtn) {
      return;
    }

    const shouldShowRestart = this.currentModule !== 'mod-cover';
    restartBtn.classList.toggle('hidden', !shouldShowRestart);
  },

  /**
   * 切换到指定模块
   */
  goTo(moduleId) {
    if (moduleId === 'mod-cream-paint') {
      moduleId = 'mod-decorate';
    }

    const currentEl = document.getElementById(this.currentModule);
    const nextEl = document.getElementById(moduleId);

    if (!nextEl) {
      console.error('Module not found:', moduleId);
      return;
    }

    // 销毁当前模块
    const currentMod = this.modules[this.currentModule];
    if (currentMod && currentMod.destroy) {
      currentMod.destroy();
    }

    // 淡出当前
    currentEl.classList.add('fade-out');
    currentEl.classList.remove('active');

    // 延迟后激活下一个
    setTimeout(() => {
      currentEl.classList.remove('fade-out');
      nextEl.classList.add('active');
      this.currentModule = moduleId;
      this.state.lastModule = moduleId;
      this.saveState();
      this.updateGlobalActionButtons();

      // 初始化新模块
      const nextMod = this.modules[moduleId];
      if (nextMod && nextMod.init) {
        nextMod.init();
      }
    }, 500);
  },

  /**
   * 应用启动
   */
  start() {
    this.loadState();
    const albumBtn = document.getElementById('global-album-btn');
    const restartBtn = document.getElementById('global-restart-btn');
    if (albumBtn) {
      albumBtn.onclick = () => {
        AlbumModule.open();
      };
    }
    if (restartBtn) {
      restartBtn.onclick = () => {
        this.restartCreation();
      };
    }
    this.updateGlobalActionButtons();
    // 初始化封面模块
    const coverMod = this.modules['mod-cover'];
    if (coverMod && coverMod.init) {
      coverMod.init();
    }

    if (this.state.lastModule && this.state.lastModule !== 'mod-cover') {
      setTimeout(() => {
        this.goTo(this.state.lastModule);
      }, 50);
    }
  },
};

// 页面加载完毕后启动
document.addEventListener('DOMContentLoaded', () => {
  App.start();
});