/**
 * 模块6: 截图分享
 */
const ScreenshotModule = {
  _template: 'polaroid',
  _cakeLayers: [],
  _decorationImages: new Map(),

  async init() {
    this._template = 'polaroid';
    await this._loadAssets();
    this._renderPreview();
    this._setupTemplates();
    this._setupActions();
  },

  async _loadAssets() {
    this._cakeLayers = await Utils.loadCakeLayers(App.state.cakeType || 'single');
    this._decorationImages = await Utils.loadDecorationImagesForState(App.state.decorations || []);
  },

  _renderPreview() {
    const canvas = document.getElementById('screenshot-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 600;
    canvas.height = 800;

    this._drawBackground(ctx, canvas);

    const frame = { x: 42, y: 34, width: 516, height: 656 };
    ctx.save();
    ctx.shadowColor = 'rgba(115, 82, 35, 0.18)';
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(frame.x, frame.y, frame.width, frame.height);
    ctx.restore();

    ctx.strokeStyle = 'rgba(139,90,43,0.12)';
    ctx.lineWidth = 2;
    ctx.strokeRect(frame.x, frame.y, frame.width, frame.height);

    const cakeCanvas = document.createElement('canvas');
    cakeCanvas.width = 420;
    cakeCanvas.height = 420;
    const cakeCtx = cakeCanvas.getContext('2d');
    const layout = Utils.getCakeLayout(cakeCanvas, this._cakeLayers);
    const maskCanvas = Utils.createMaskCanvas(cakeCanvas.width, cakeCanvas.height, layout);
    Utils.drawCakeArtwork(cakeCtx, {
      layout,
      maskCanvas,
      creamColor: App.state.creamColor || CONFIG.creamColors[0],
      strokes: App.state.paintStrokes || [],
      decorations: App.state.decorations || [],
      decorationImages: this._decorationImages,
    });

    const cakeSize = frame.width - 96;
    ctx.drawImage(cakeCanvas, frame.x + 48, frame.y + 42, cakeSize, cakeSize);
    this._drawTemplateAccent(ctx, frame);

    ctx.fillStyle = '#8B5A2B';
    ctx.font = '20px "ZCOOL KuaiLe", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(CONFIG.birthday.theme, 300, 728);
    ctx.font = '15px "ZCOOL KuaiLe", sans-serif';
    ctx.fillStyle = 'rgba(139,90,43,0.7)';
    ctx.fillText(`${CONFIG.birthday.name} · ${CONFIG.birthday.date}`, 300, 758);
  },

  _drawBackground(ctx, canvas) {
    if (this._template === 'spring_summer') {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#F3C200');
      gradient.addColorStop(0.55, '#FFD49A');
      gradient.addColorStop(1, '#FFE7D9');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    if (this._template === 'cream_daisy') {
      ctx.fillStyle = '#F5EFCB';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      this._drawDaisy(ctx, 88, 90, 20);
      this._drawDaisy(ctx, 525, 118, 16);
      this._drawDaisy(ctx, 85, 710, 18);
      this._drawDaisy(ctx, 512, 680, 22);
      return;
    }

    ctx.fillStyle = '#FFF3D4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  },

  _drawTemplateAccent(ctx, frame) {
    if (this._template === 'spring_summer') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(frame.x + 34, frame.y + 24);
      ctx.quadraticCurveTo(frame.x + 130, frame.y - 4, frame.x + 210, frame.y + 18);
      ctx.stroke();
      return;
    }

    if (this._template === 'cream_daisy') {
      this._drawDaisy(ctx, frame.x + 68, frame.y + frame.height - 52, 12);
      this._drawDaisy(ctx, frame.x + frame.width - 68, frame.y + frame.height - 52, 12);
      return;
    }

    ctx.fillStyle = 'rgba(139,90,43,0.1)';
    ctx.fillRect(frame.x + 32, frame.y + frame.height - 120, frame.width - 64, 2);
  },

  _drawDaisy(ctx, x, y, size) {
    ctx.save();
    for (let index = 0; index < 8; index += 1) {
      const angle = (Math.PI * 2 * index) / 8;
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.beginPath();
      ctx.ellipse(
        x + Math.cos(angle) * size * 0.8,
        y + Math.sin(angle) * size * 0.8,
        size * 0.34,
        size * 0.56,
        angle,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.fillStyle = '#F3C200';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  _setupTemplates() {
    const btns = document.querySelectorAll('#screenshot-templates .template-btn');
    btns.forEach((btn) => {
      btn.onclick = () => {
        btns.forEach((item) => item.classList.remove('active'));
        btn.classList.add('active');
        this._template = btn.dataset.tpl;
        this._renderPreview();
      };
    });
  },

  _setupActions() {
    document.getElementById('screenshot-save').onclick = () => {
      this._saveToAlbum();
    };
    document.getElementById('screenshot-album').onclick = () => {
      AlbumModule.open();
    };
    document.getElementById('screenshot-skip').onclick = () => {
      App.goTo('mod-ceremony');
    };
  },

  async _saveToAlbum() {
    const canvas = document.getElementById('screenshot-canvas');
    const dataUrl = canvas.toDataURL('image/png');
    try {
      await AlbumModule.savePhoto(dataUrl, this._template);
      App.saveState();
      Utils.showToast('已保存到相册 ✅', 1500);
      setTimeout(() => {
        App.goTo('mod-ceremony');
      }, 300);
    } catch (error) {
      console.warn('save to album failed', error);
      // 降级：直接下载
      const link = document.createElement('a');
      link.download = 'birthday_cake.png';
      link.href = dataUrl;
      link.click();
      Utils.showToast('已保存到本地', 1500);
      setTimeout(() => {
        App.goTo('mod-ceremony');
      }, 300);
    }
  },

  destroy() {},
};