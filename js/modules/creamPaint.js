/**
 * 模块4: 抹奶油 & 裱花
 * 使用真实蛋糕透明区域作为可绘制蒙版，支持颜色、透明度和奶油裱花质感
 */
const CreamPaintModule = {
	strokes: [],
	_currentStroke: null,
	_drawing: false,
	_cakeLayers: [],
	_layout: null,
	_maskCanvas: null,
	_decorationImages: new Map(),
	_cleanupFns: [],

	async init() {
		this.canvas = document.getElementById('paint-canvas');
		this.ctx = this.canvas.getContext('2d');
		this.strokes = (App.state.paintStrokes || []).map((stroke) => ({
			...stroke,
			points: (stroke.points || []).map((point) => ({ ...point })),
		}));

		this._resizeCanvas();
		await this._loadCakeLayers();
		await this._loadDecorationImages();
		this._layout = Utils.getCakeLayout(this.canvas, this._cakeLayers);
		this._maskCanvas = Utils.createMaskCanvas(this.canvas.width, this.canvas.height, this._layout);
		this._setupControls();
		this._bindCanvasEvents();
		this._bindUiEvents();
		this._render();
	},

	_resizeCanvas() {
		const rect = this.canvas.parentElement.getBoundingClientRect();
		this.canvas.width = Math.max(360, Math.round(rect.width * 2));
		this.canvas.height = Math.max(360, Math.round(rect.height * 2));
	},

	async _loadCakeLayers() {
		this._cakeLayers = await Utils.loadCakeLayers(App.state.cakeType || 'single');
	},

	async _loadDecorationImages() {
		this._decorationImages.clear();
		const decorations = App.state.decorations || [];
		const uniqueSrc = [...new Set(decorations.map((item) => item.src).filter(Boolean))];
		await Promise.all(uniqueSrc.map(async (src) => {
			try {
				const image = await Utils.loadImage(src);
				this._decorationImages.set(src, image);
			} catch (error) {
				console.warn('decoration preview load failed', src, error);
			}
		}));
	},

	_setupControls() {
		const picker = document.getElementById('paint-color-picker');
		const sizeInput = document.getElementById('brush-size');
		const opacityInput = document.getElementById('paint-opacity');
		const settings = App.state.editorSettings;

		picker.innerHTML = '';
		CONFIG.editorColors.forEach((color) => {
			const chip = document.createElement('button');
			chip.type = 'button';
			chip.className = `paint-color-chip${settings.color === color ? ' active' : ''}`;
			chip.style.background = color;
			chip.addEventListener('click', () => {
				App.state.editorSettings.color = color;
				picker.querySelectorAll('.paint-color-chip').forEach((item) => item.classList.remove('active'));
				chip.classList.add('active');
				App.saveState();
			});
			picker.appendChild(chip);
		});

		sizeInput.value = settings.size;
		opacityInput.value = Math.round(settings.opacity * 100);
	},

	_bindUiEvents() {
		const sizeInput = document.getElementById('brush-size');
		const opacityInput = document.getElementById('paint-opacity');
		const undoBtn = document.getElementById('paint-undo');
		const clearBtn = document.getElementById('paint-clear');
		const nextBtn = document.getElementById('cream-paint-next');

		sizeInput.oninput = () => {
			App.state.editorSettings.size = parseInt(sizeInput.value, 10);
			App.saveState();
		};
		opacityInput.oninput = () => {
			App.state.editorSettings.opacity = parseInt(opacityInput.value, 10) / 100;
			App.saveState();
		};
		undoBtn.onclick = () => {
			this.strokes.pop();
			this._syncStrokes();
			this._render();
		};
		clearBtn.onclick = () => {
			this.strokes = [];
			this._syncStrokes();
			this._render();
		};
		nextBtn.onclick = () => {
			this._syncStrokes();
			App.goTo('mod-decorate');
		};
	},

	_bindCanvasEvents() {
		const start = (event) => {
			event.preventDefault();
			const point = Utils.getCanvasPos(this.canvas, event);
			if (!Utils.pointInMask(this._maskCanvas, point.x, point.y)) {
				return;
			}
			this._drawing = true;
			this._currentStroke = {
				points: [this._normalizePoint(point)],
				color: App.state.editorSettings.color,
				opacity: App.state.editorSettings.opacity,
				width: parseInt(document.getElementById('brush-size').value, 10) * 1.6,
				seed: Date.now() % 100000,
			};
			this._render();
		};

		const move = (event) => {
			if (!this._drawing || !this._currentStroke) {
				return;
			}
			event.preventDefault();
			const point = Utils.getCanvasPos(this.canvas, event);
			if (!Utils.pointInMask(this._maskCanvas, point.x, point.y)) {
				return;
			}
			this._currentStroke.points.push(this._normalizePoint(point));
			this._render();
		};

		const end = () => {
			if (this._drawing && this._currentStroke && this._currentStroke.points.length > 1) {
				this.strokes.push(this._currentStroke);
				this._syncStrokes();
			}
			this._drawing = false;
			this._currentStroke = null;
			this._render();
		};

		this.canvas.addEventListener('mousedown', start);
		this.canvas.addEventListener('mousemove', move);
		this.canvas.addEventListener('mouseup', end);
		this.canvas.addEventListener('mouseleave', end);
		this.canvas.addEventListener('touchstart', start, { passive: false });
		this.canvas.addEventListener('touchmove', move, { passive: false });
		this.canvas.addEventListener('touchend', end);

		this._cleanupFns.push(() => {
			this.canvas.removeEventListener('mousedown', start);
			this.canvas.removeEventListener('mousemove', move);
			this.canvas.removeEventListener('mouseup', end);
			this.canvas.removeEventListener('mouseleave', end);
			this.canvas.removeEventListener('touchstart', start);
			this.canvas.removeEventListener('touchmove', move);
			this.canvas.removeEventListener('touchend', end);
		});
	},

	_normalizePoint(point) {
		const frame = this._layout.frame;
		return {
			nx: (point.x - frame.x) / frame.width,
			ny: (point.y - frame.y) / frame.height,
		};
	},

	_getAbsolutePoints(stroke) {
		const frame = this._layout.frame;
		return stroke.points.map((point) => ({
			x: frame.x + point.nx * frame.width,
			y: frame.y + point.ny * frame.height,
		}));
	},

	_render() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		Utils.drawCakeLayers(this.ctx, this._layout);
		this._renderStrokes();
		this._renderDecorationsPreview();
	},

	_renderStrokes() {
		const allStrokes = this._currentStroke
			? [...this.strokes, this._currentStroke]
			: this.strokes;

		Utils.renderMaskedLayer(this.ctx, this._maskCanvas, (layerCtx) => {
			allStrokes.forEach((stroke) => {
				if (!stroke.points || stroke.points.length < 2) {
					return;
				}
				Utils.drawCreamStroke(layerCtx, this._getAbsolutePoints(stroke), {
					color: stroke.color,
					opacity: stroke.opacity,
					width: stroke.width,
					seed: stroke.seed,
				});
			});
		});
	},

	_renderDecorationsPreview() {
		const decorations = App.state.decorations || [];
		const frame = this._layout.frame;

		decorations.forEach((item) => {
			const image = this._decorationImages.get(item.src);
			if (!image) {
				return;
			}
			const position = this._getDecorationPosition(item, frame);
			const size = frame.width * (item.scale || 0.18);
			this.ctx.save();
			this.ctx.translate(position.x, position.y);
			this.ctx.rotate(item.rotation || 0);
			this.ctx.globalAlpha = 0.98;
			this.ctx.drawImage(image, -size / 2, -size / 2, size, size);
			this.ctx.restore();
		});
	},

	_getDecorationPosition(item, frame) {
		if (typeof item.nx === 'number' && typeof item.ny === 'number') {
			return {
				x: frame.x + item.nx * frame.width,
				y: frame.y + item.ny * frame.height,
			};
		}

		return {
			x: frame.x + frame.width * (0.5 + (item.rx || 0) * 0.5),
			y: frame.y + frame.height * (0.5 + (item.ry || 0) * 0.5),
		};
	},

	_syncStrokes() {
		App.state.paintStrokes = this.strokes.map((stroke) => ({
			...stroke,
			points: stroke.points.map((point) => ({ ...point })),
		}));
		App.saveState();
	},

	destroy() {
		this._syncStrokes();
		this._cleanupFns.forEach((cleanup) => cleanup());
		this._cleanupFns = [];
	},
};
