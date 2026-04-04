/**
 * 模块5: 蛋糕装饰
 * 在同一画布中同步展示奶油、蜡笔涂鸦和装饰元素
 * 装饰素材从底部面板直接拖拽到蛋糕上
 */
const DecorateModule = {
	elements: [],
	strokes: [],
	activeTab: 'candles',
	_cakeLayers: [],
	_layout: null,
	_maskCanvas: null,
	_currentStroke: null,
	_drawing: false,
	_draggingElement: false,
	_selectedIdx: -1,
	_dragOffset: { x: 0, y: 0 },
	_longPressTimer: null,
	_paletteDrag: null,
	_paletteGhost: null,
	_pinch: null,
	_cleanupFns: [],

	async init() {
		this.canvas = document.getElementById('decorate-canvas');
		this.ctx = this.canvas.getContext('2d');
		this.carousel = document.getElementById('decorate-carousel');
		this.itemsTrack = document.getElementById('decorate-items-track');
		this.itemsContainer = document.getElementById('decorate-items');
		this.paintTools = document.getElementById('decorate-paint-tools');
		this.tipEl = document.getElementById('decorate-tip');
		this.selectionTools = document.getElementById('decorate-selection-tools');
		this.strokes = (App.state.paintStrokes || []).map((stroke) => ({
			...stroke,
			points: (stroke.points || []).map((point) => ({ ...point })),
		}));

		this._resizeCanvas();
		await this._loadCakeLayers();
		this._layout = Utils.getCakeLayout(this.canvas, this._cakeLayers);
		this._maskCanvas = Utils.createMaskCanvas(this.canvas.width, this.canvas.height, this._layout);
		await this._hydrateElements();
		this._setupTabs();
		this._setupPaintControls();
		this._bindCanvasEvents();
		this._bindUiEvents();
		this._updateSelectionTools();
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

	async _hydrateElements() {
		const items = App.state.decorations || [];
		const results = await Promise.all(items.map(async (item) => {
			try {
				const image = await Utils.loadImage(item.src);
				return {
					...item,
					nx: typeof item.nx === 'number' ? item.nx : 0.5 + (item.rx || 0) * 0.5,
					ny: typeof item.ny === 'number' ? item.ny : 0.5 + (item.ry || 0) * 0.5,
					scale: item.scale || 0.18,
					rotation: item.rotation || 0,
					img: image,
				};
			} catch (error) {
				console.warn('decoration load failed, removing:', item.src, error);
				return null;
			}
		}));
		this.elements = results.filter(Boolean);
		if (this.elements.length !== items.length) {
			this._syncState();
		}
	},

	_setupTabs() {
		const tabs = document.querySelectorAll('#decorate-tabs .tab-btn');
		tabs.forEach((tab) => {
			tab.classList.toggle('active', tab.dataset.tab === this.activeTab);
			tab.onclick = () => {
				tabs.forEach((item) => item.classList.remove('active'));
				tab.classList.add('active');
				this.activeTab = tab.dataset.tab;
				this.paintTools.classList.toggle('hidden', this.activeTab !== 'paint');
				this.carousel.classList.toggle('hidden', this.activeTab === 'paint');
				this._updateSelectionTools();
				this.tipEl.textContent = this.activeTab === 'paint'
					? '在蛋糕上继续涂鸦，装饰会同步预览在成品上。'
					: '按住下方素材直接拖到蛋糕上；手机端可先点选素材，再用下方按钮放大、缩小、旋转或删除。';
				this._renderItems();
				this._render();
			};
		});
		this.paintTools.classList.toggle('hidden', this.activeTab !== 'paint');
		this.carousel.classList.toggle('hidden', this.activeTab === 'paint');
		this.tipEl.textContent = '按住下方素材直接拖到蛋糕上；手机端可先点选素材，再用下方按钮放大、缩小、旋转或删除。';
		this._renderItems();
	},

	_setupPaintControls() {
		const picker = document.getElementById('decorate-paint-color-picker');
		const sizeInput = document.getElementById('decorate-brush-size');
		const opacityInput = document.getElementById('decorate-paint-opacity');
		const settings = App.state.editorSettings;

		picker.innerHTML = '';
		CONFIG.editorColors.forEach((color) => {
			const chip = document.createElement('button');
			chip.type = 'button';
			chip.className = `paint-color-chip${settings.color === color ? ' active' : ''}`;
			chip.style.background = color;
			chip.onclick = () => {
				App.state.editorSettings.color = color;
				picker.querySelectorAll('.paint-color-chip').forEach((item) => item.classList.remove('active'));
				chip.classList.add('active');
				App.saveState();
			};
			picker.appendChild(chip);
		});

		sizeInput.value = settings.size;
		opacityInput.value = Math.round(settings.opacity * 100);
	},

	_bindUiEvents() {
		document.getElementById('decorate-scroll-left').onclick = () => {
			this.itemsTrack.scrollBy({ left: -220, behavior: 'smooth' });
		};
		document.getElementById('decorate-scroll-right').onclick = () => {
			this.itemsTrack.scrollBy({ left: 220, behavior: 'smooth' });
		};
		document.getElementById('decorate-brush-size').oninput = (event) => {
			App.state.editorSettings.size = parseInt(event.target.value, 10);
			App.saveState();
		};
		document.getElementById('decorate-paint-opacity').oninput = (event) => {
			App.state.editorSettings.opacity = parseInt(event.target.value, 10) / 100;
			App.saveState();
		};
		document.getElementById('decorate-undo').onclick = () => {
			this.strokes.pop();
			this._syncState();
			this._render();
		};
		document.getElementById('decorate-clear').onclick = () => {
			this.strokes = [];
			this._syncState();
			this._render();
		};
		document.getElementById('decorate-scale-down').onclick = () => this._nudgeSelectedElementScale(-0.018);
		document.getElementById('decorate-scale-up').onclick = () => this._nudgeSelectedElementScale(0.018);
		document.getElementById('decorate-rotate-left').onclick = () => this._nudgeSelectedElementRotation(-0.12);
		document.getElementById('decorate-rotate-right').onclick = () => this._nudgeSelectedElementRotation(0.12);
		document.getElementById('decorate-delete-selected').onclick = () => this._deleteSelectedElement();
		document.getElementById('decorate-done').onclick = () => {
			if (!this.elements.some((item) => item.isCandle)) {
				Utils.showToast('请至少添加一根蜡烛哦～', 1800);
				return;
			}
			this._syncState();
			App.goTo('mod-screenshot');
		};
	},

	_renderItems() {
		if (this.activeTab === 'paint') {
			this.itemsContainer.innerHTML = '';
			return;
		}

		const items = this._getSortedItems();
		this.itemsContainer.innerHTML = '';
		items.forEach((item) => {
			const node = document.createElement('button');
			node.type = 'button';
			node.className = 'decorate-item';
			node.innerHTML = `<img src="${CONFIG.imgBase + item.src}.webp" alt="${item.name}" draggable="false">`;
			node.querySelector('img').onerror = function onItemError() {
				this.src = `${CONFIG.imgBase + item.src}.png`;
			};
			this._bindPaletteItem(node, item);
			this.itemsContainer.appendChild(node);
		});
	},

	_getSortedItems() {
		const items = [...(CONFIG.decorations[this.activeTab] || [])];
		if (this.activeTab !== 'candles') {
			return items;
		}

		const groupOrder = (item) => {
			if (item.id.startsWith('mini_')) return 0;
			if (item.id.startsWith('slim_')) return 1;
			if (item.id.startsWith('num_')) return 2;
			return 3;
		};
		const getNumericOrder = (item) => {
			const match = item.id.match(/_(\d+)$/);
			return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
		};

		return items.sort((left, right) => {
			const groupDiff = groupOrder(left) - groupOrder(right);
			if (groupDiff !== 0) {
				return groupDiff;
			}
			return getNumericOrder(left) - getNumericOrder(right);
		});
	},

	_bindPaletteItem(node, item) {
		const start = (event) => {
			event.preventDefault();
			node.classList.add('drag-source');
			this._paletteDrag = { item, node };
			this._createPaletteGhost(item, event);

			const move = (moveEvent) => {
				if (!this._paletteDrag) {
					return;
				}
				moveEvent.preventDefault();
				this._movePaletteGhost(moveEvent);
			};

			const end = (endEvent) => {
				if (!this._paletteDrag) {
					return;
				}

				const point = this._getCanvasPointFromEvent(endEvent);
				const activeItem = this._paletteDrag.item;
				node.classList.remove('drag-source');
				this._destroyPaletteGhost();
				this._paletteDrag = null;
				document.removeEventListener('mousemove', move);
				document.removeEventListener('touchmove', move);
				document.removeEventListener('mouseup', end);
				document.removeEventListener('touchend', end);

				if (point) {
					this._addElementAt(activeItem, point);
				}
			};

			document.addEventListener('mousemove', move, { passive: false });
			document.addEventListener('touchmove', move, { passive: false });
			document.addEventListener('mouseup', end);
			document.addEventListener('touchend', end);
		};

		node.addEventListener('mousedown', start);
		node.addEventListener('touchstart', start, { passive: false });
		this._cleanupFns.push(() => {
			node.removeEventListener('mousedown', start);
			node.removeEventListener('touchstart', start);
		});
	},

	_createPaletteGhost(item, event) {
		this._destroyPaletteGhost();
		const ghost = document.createElement('div');
		ghost.className = 'palette-drag-ghost';
		ghost.innerHTML = `<img src="${CONFIG.imgBase + item.src}.webp" alt="${item.name}">`;
		ghost.querySelector('img').onerror = function onGhostError() {
			this.src = `${CONFIG.imgBase + item.src}.png`;
		};
		document.body.appendChild(ghost);
		this._paletteGhost = ghost;
		this._movePaletteGhost(event);
	},

	_movePaletteGhost(event) {
		if (!this._paletteGhost) {
			return;
		}
		const source = event.changedTouches && event.changedTouches.length > 0
			? event.changedTouches[0]
			: event.touches && event.touches.length > 0
				? event.touches[0]
				: event;
		this._paletteGhost.style.left = `${source.clientX}px`;
		this._paletteGhost.style.top = `${source.clientY}px`;
	},

	_destroyPaletteGhost() {
		if (this._paletteGhost) {
			this._paletteGhost.remove();
			this._paletteGhost = null;
		}
	},

	_getCanvasPointFromEvent(event) {
		const source = event.changedTouches && event.changedTouches.length > 0
			? event.changedTouches[0]
			: event;
		const rect = this.canvas.getBoundingClientRect();
		if (source.clientX < rect.left || source.clientX > rect.right || source.clientY < rect.top || source.clientY > rect.bottom) {
			return null;
		}
		return Utils.getCanvasPos(this.canvas, event);
	},

	async _addElementAt(item, point) {
		const image = await Utils.loadImage(item.src);
		this.elements.push({
			id: `${item.id}_${Date.now()}`,
			src: item.src,
			nx: (point.x - this._layout.frame.x) / this._layout.frame.width,
			ny: (point.y - this._layout.frame.y) / this._layout.frame.height,
			scale: this._getInitialElementScale(item),
			rotation: 0,
			isCandle: !!item.isCandle,
			img: image,
		});
		this._selectedIdx = this.elements.length - 1;
		this._syncState();
		this._updateSelectionTools();
		this._render();
	},

	_getInitialElementScale(item) {
		if (item.id.startsWith('mini_')) {
			return 0.12;
		}
		if (item.id.startsWith('slim_') || item.id.startsWith('num_')) {
			return 0.16;
		}
		if (item.id.startsWith('sugar_')) {
			return 0.1;
		}
		return 0.18;
	},

	_bindCanvasEvents() {
		const start = (event) => {
			if (this._paletteDrag) {
				return;
			}

			// 双指手势：旋转 + 缩放
			if (event.touches && event.touches.length === 2 && this._selectedIdx >= 0) {
				event.preventDefault();
				const t1 = event.touches[0];
				const t2 = event.touches[1];
				this._pinch = {
					startAngle: Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX),
					startDist: Utils.distance(t1.clientX, t1.clientY, t2.clientX, t2.clientY),
					startRotation: this.elements[this._selectedIdx].rotation || 0,
					startScale: this.elements[this._selectedIdx].scale || 0.18,
				};
				return;
			}

			event.preventDefault();
			const point = Utils.getCanvasPos(this.canvas, event);
			const hitIndex = this._hitTestElement(point);

			if (hitIndex >= 0) {
				this._selectedIdx = hitIndex;
				this._draggingElement = true;
				const element = this.elements[hitIndex];
				const position = this._getElementPosition(element);
				this._dragOffset = { x: point.x - position.x, y: point.y - position.y };
				this._longPressTimer = setTimeout(() => {
					if (this._selectedIdx >= 0) {
						this.elements.splice(this._selectedIdx, 1);
						this._selectedIdx = -1;
						this._syncState();
						this._updateSelectionTools();
						this._render();
					}
				}, 900);
				this._updateSelectionTools();
				this._render();
				return;
			}

			this._selectedIdx = -1;
			this._updateSelectionTools();
			if (this.activeTab !== 'paint' || !Utils.pointInMask(this._maskCanvas, point.x, point.y)) {
				this._render();
				return;
			}

			this._drawing = true;
			this._currentStroke = {
				points: [this._normalizePoint(point)],
				color: App.state.editorSettings.color,
				opacity: App.state.editorSettings.opacity,
				width: parseInt(document.getElementById('decorate-brush-size').value, 10) * 1.6,
				seed: Date.now() % 100000,
			};
			this._render();
		};

		const move = (event) => {
			// 双指手势处理
			if (this._pinch && event.touches && event.touches.length === 2 && this._selectedIdx >= 0) {
				event.preventDefault();
				const t1 = event.touches[0];
				const t2 = event.touches[1];
				const angle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX);
				const dist = Utils.distance(t1.clientX, t1.clientY, t2.clientX, t2.clientY);
				const element = this.elements[this._selectedIdx];
				element.rotation = this._pinch.startRotation + (angle - this._pinch.startAngle);
				const scaleFactor = dist / this._pinch.startDist;
				element.scale = Utils.clamp(this._pinch.startScale * scaleFactor, 0.08, 0.5);
				this._render();
				return;
			}

			const point = Utils.getCanvasPos(this.canvas, event);

			if (this._draggingElement && this._selectedIdx >= 0) {
				event.preventDefault();
				clearTimeout(this._longPressTimer);
				const element = this.elements[this._selectedIdx];
				element.nx = ((point.x - this._dragOffset.x) - this._layout.frame.x) / this._layout.frame.width;
				element.ny = ((point.y - this._dragOffset.y) - this._layout.frame.y) / this._layout.frame.height;
				this._render();
				return;
			}

			if (!this._drawing || !this._currentStroke) {
				return;
			}

			event.preventDefault();
			if (!Utils.pointInMask(this._maskCanvas, point.x, point.y)) {
				return;
			}
			this._currentStroke.points.push(this._normalizePoint(point));
			this._render();
		};

		const end = () => {
			clearTimeout(this._longPressTimer);
			this._pinch = null;

			if (this._drawing && this._currentStroke && this._currentStroke.points.length > 1) {
				this.strokes.push(this._currentStroke);
				this._syncState();
			}

			if (this._draggingElement) {
				this._syncState();
			}

			this._drawing = false;
			this._draggingElement = false;
			this._currentStroke = null;
			this._updateSelectionTools();
			this._render();
		};

		const wheel = (event) => {
			if (this._selectedIdx < 0) {
				return;
			}
			event.preventDefault();
			const element = this.elements[this._selectedIdx];
			if (event.shiftKey) {
				element.rotation += event.deltaY > 0 ? -0.08 : 0.08;
			} else {
				element.scale = Utils.clamp(element.scale + (event.deltaY > 0 ? -0.03 : 0.03), 0.08, 0.5);
			}
			this._syncState();
			this._render();
		};

		this.canvas.addEventListener('mousedown', start);
		this.canvas.addEventListener('mousemove', move);
		this.canvas.addEventListener('mouseup', end);
		this.canvas.addEventListener('mouseleave', end);
		this.canvas.addEventListener('touchstart', start, { passive: false });
		this.canvas.addEventListener('touchmove', move, { passive: false });
		this.canvas.addEventListener('touchend', end);
		this.canvas.addEventListener('wheel', wheel, { passive: false });

		this._cleanupFns.push(() => {
			this.canvas.removeEventListener('mousedown', start);
			this.canvas.removeEventListener('mousemove', move);
			this.canvas.removeEventListener('mouseup', end);
			this.canvas.removeEventListener('mouseleave', end);
			this.canvas.removeEventListener('touchstart', start);
			this.canvas.removeEventListener('touchmove', move);
			this.canvas.removeEventListener('touchend', end);
			this.canvas.removeEventListener('wheel', wheel);
		});
	},

	_normalizePoint(point) {
		const frame = this._layout.frame;
		return {
			nx: (point.x - frame.x) / frame.width,
			ny: (point.y - frame.y) / frame.height,
		};
	},

	_getStrokeAbsolutePoints(stroke) {
		const frame = this._layout.frame;
		return stroke.points.map((point) => ({
			x: frame.x + point.nx * frame.width,
			y: frame.y + point.ny * frame.height,
		}));
	},

	_getElementPosition(element) {
		return {
			x: this._layout.frame.x + element.nx * this._layout.frame.width,
			y: this._layout.frame.y + element.ny * this._layout.frame.height,
		};
	},

	_getElementRenderSize(element) {
		return Utils.getDecorationRenderSize(element.img, this._layout.frame, element.scale || 0.18);
	},

	_hitTestElement(point) {
		for (let index = this.elements.length - 1; index >= 0; index -= 1) {
			const element = this.elements[index];
			const position = this._getElementPosition(element);
			const size = this._getElementRenderSize(element);
			if (Math.abs(point.x - position.x) <= size.width * 0.56 && Math.abs(point.y - position.y) <= size.height * 0.56) {
				return index;
			}
		}
		return -1;
	},

	_render() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		Utils.drawCakeLayers(this.ctx, this._layout);
		this._renderStrokes();
		this._renderElements();
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
				Utils.drawCrayonStroke(layerCtx, this._getStrokeAbsolutePoints(stroke), {
					color: stroke.color,
					opacity: stroke.opacity,
					width: stroke.width,
					seed: stroke.seed,
				});
			});
		});
	},

	_renderElements() {
		this.elements.forEach((element, index) => {
			const size = this._getElementRenderSize(element);
			const position = this._getElementPosition(element);
			this.ctx.save();
			this.ctx.translate(position.x, position.y);
			this.ctx.rotate(element.rotation || 0);
			this.ctx.drawImage(element.img, -size.width / 2, -size.height / 2, size.width, size.height);
			if (index === this._selectedIdx) {
				this.ctx.strokeStyle = 'rgba(139,90,43,0.6)';
				this.ctx.lineWidth = 2;
				this.ctx.setLineDash([6, 4]);
				this.ctx.strokeRect(-size.width / 2 - 6, -size.height / 2 - 6, size.width + 12, size.height + 12);
				this.ctx.setLineDash([]);
			}
			this.ctx.restore();
		});
	},

	_updateSelectionTools() {
		if (!this.selectionTools) {
			return;
		}
		const shouldShow = this.activeTab !== 'paint' && this._selectedIdx >= 0 && this._selectedIdx < this.elements.length;
		this.selectionTools.classList.toggle('hidden', !shouldShow);
	},

	_nudgeSelectedElementScale(delta) {
		if (this._selectedIdx < 0) {
			return;
		}
		const element = this.elements[this._selectedIdx];
		element.scale = Utils.clamp((element.scale || 0.18) + delta, 0.08, 0.5);
		this._syncState();
		this._render();
	},

	_nudgeSelectedElementRotation(delta) {
		if (this._selectedIdx < 0) {
			return;
		}
		const element = this.elements[this._selectedIdx];
		element.rotation = (element.rotation || 0) + delta;
		this._syncState();
		this._render();
	},

	_deleteSelectedElement() {
		if (this._selectedIdx < 0) {
			return;
		}
		this.elements.splice(this._selectedIdx, 1);
		this._selectedIdx = -1;
		this._syncState();
		this._updateSelectionTools();
		this._render();
	},

	_syncState() {
		App.state.paintStrokes = this.strokes.map((stroke) => ({
			...stroke,
			points: stroke.points.map((point) => ({ ...point })),
		}));
		App.state.decorations = this.elements.map(({ img, ...rest }) => ({ ...rest }));
		App.saveState();
	},

	destroy() {
		this._syncState();
		this._destroyPaletteGhost();
		this._cleanupFns.forEach((cleanup) => cleanup());
		this._cleanupFns = [];
	},
};
