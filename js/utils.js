/**
 * 工具函数
 */
const Utils = {
  /**
   * 加载图片，支持 WebP 优先 + PNG 回退
   * @param {string} relPath - 相对于 imgBase 的路径（不含后缀）
   * @returns {Promise<HTMLImageElement>}
   */
  loadImage(relPath) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const webpSrc = CONFIG.imgBase + relPath + '.webp';
      const pngSrc = CONFIG.imgBase + relPath + '.png';
      img.onload = () => resolve(img);
      img.onerror = () => {
        // WebP 失败，回退 PNG
        const fallback = new Image();
        fallback.onload = () => resolve(fallback);
        fallback.onerror = () => reject(new Error('Failed to load: ' + relPath));
        fallback.src = pngSrc;
      };
      img.src = webpSrc;
    });
  },

  /**
   * 预加载一组图片
   * @param {string[]} paths
   * @returns {Promise<Map<string, HTMLImageElement>>}
   */
  async preloadImages(paths) {
    const map = new Map();
    const tasks = paths.map(async (p) => {
      try {
        const img = await Utils.loadImage(p);
        map.set(p, img);
      } catch (e) {
        console.warn('Image not found:', p);
      }
    });
    await Promise.all(tasks);
    return map;
  },

  /**
   * 计算两点之间的距离
   */
  distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  },

  clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  },

  hexToRgba(hex, alpha = 1) {
    const safe = hex.replace('#', '');
    const normalized = safe.length === 3
      ? safe.split('').map((item) => item + item).join('')
      : safe;
    const value = parseInt(normalized, 16);
    const red = (value >> 16) & 255;
    const green = (value >> 8) & 255;
    const blue = value & 255;
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  },

  seededNoise(seed, index) {
    const value = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
    return (value - Math.floor(value)) * 2 - 1;
  },

  /**
   * 计算角度（弧度）
   */
  angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  },

  /**
   * 获取 Canvas 上的触摸/鼠标坐标（转换为 Canvas 内部坐标）
   */
  getCanvasPos(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX, clientY;
    if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  },

  /**
   * 节流函数
   */
  throttle(fn, ms) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= ms) {
        last = now;
        fn.apply(this, args);
      }
    };
  },

  /**
   * 显示浮动提示
   */
  showToast(text, duration = 1500) {
    let toast = document.getElementById('global-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'global-toast';
      toast.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%);
        background: rgba(139,90,43,0.9); color: #FFF3D4;
        padding: 0.8rem 1.5rem; border-radius: 16px;
        font-family: var(--font-body); font-size: 1rem;
        z-index: 9999; pointer-events: none;
        transition: opacity 300ms ease;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.style.opacity = '1';
    toast.style.display = 'block';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, duration);
  },

  /**
   * 判断点是否在圆内
   */
  isInCircle(px, py, cx, cy, r) {
    return Utils.distance(px, py, cx, cy) <= r;
  },

  /**
   * 判断点是否在椭圆内
   */
  isInEllipse(px, py, cx, cy, rx, ry) {
    return ((px - cx) ** 2) / (rx ** 2) + ((py - cy) ** 2) / (ry ** 2) <= 1;
  },

  getAspectFitSize(image, longSide) {
    if (!image || !image.width || !image.height) {
      return { width: longSide, height: longSide };
    }

    const aspect = image.width / image.height;
    if (aspect >= 1) {
      return {
        width: longSide,
        height: longSide / aspect,
      };
    }

    return {
      width: longSide * aspect,
      height: longSide,
    };
  },

  getDecorationRenderSize(image, frame, scale = 0.18) {
    const longSide = frame.width * scale;
    return Utils.getAspectFitSize(image, longSide);
  },

  getCakeLayout(canvas, layerImages) {
    const safeLayers = layerImages.filter(Boolean);
    if (safeLayers.length === 0) {
      const size = Math.min(canvas.width, canvas.height) * 0.62;
      return {
        layers: [{ x: (canvas.width - size) / 2, y: (canvas.height - size) / 2, width: size, height: size }],
        frame: { x: (canvas.width - size) / 2, y: (canvas.height - size) / 2, width: size, height: size },
      };
    }

    if (safeLayers.length === 1) {
      const image = safeLayers[0];
      const scale = Math.min((canvas.width * 0.74) / image.width, (canvas.height * 0.76) / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      const x = (canvas.width - width) / 2;
      const y = canvas.height * 0.54 - height / 2;
      return {
        layers: [{ img: image, x, y, width, height }],
        frame: { x, y, width, height },
      };
    }

    const [bottomImage, topImage] = safeLayers;
    const bottomScale = Math.min((canvas.width * 0.74) / bottomImage.width, (canvas.height * 0.52) / bottomImage.height);
    const bottomWidth = bottomImage.width * bottomScale;
    const bottomHeight = bottomImage.height * bottomScale;
    const bottomX = (canvas.width - bottomWidth) / 2;
    const bottomY = canvas.height * 0.61 - bottomHeight / 2;

    const topScale = (bottomWidth * 0.56) / topImage.width;
    const topWidth = topImage.width * topScale;
    const topHeight = topImage.height * topScale;
    const topX = (canvas.width - topWidth) / 2;
    const topY = bottomY - topHeight * 0.42;

    const minX = Math.min(bottomX, topX);
    const minY = Math.min(bottomY, topY);
    const maxX = Math.max(bottomX + bottomWidth, topX + topWidth);
    const maxY = Math.max(bottomY + bottomHeight, topY + topHeight);

    return {
      layers: [
        { img: bottomImage, x: bottomX, y: bottomY, width: bottomWidth, height: bottomHeight },
        { img: topImage, x: topX, y: topY, width: topWidth, height: topHeight },
      ],
      frame: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
    };
  },

  drawCakeLayers(ctx, layout) {
    if (!layout || !layout.layers) {
      return;
    }
    for (const layer of layout.layers) {
      if (layer.img) {
        ctx.drawImage(layer.img, layer.x, layer.y, layer.width, layer.height);
      } else {
        ctx.fillStyle = '#FFF8F0';
        ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
      }
    }
  },

  createMaskCanvas(width, height, layout, options = {}) {
    const {
      decorations = [],
      decorationImages = new Map(),
    } = options;
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext('2d');
    Utils.drawCakeLayers(maskCtx, layout);

    decorations.forEach((item) => {
      const image = decorationImages.get(item.src);
      if (!image) {
        return;
      }
      const position = Utils.getDecorationPosition(item, layout.frame);
      const size = Utils.getDecorationRenderSize(image, layout.frame, item.scale || 0.18);
      maskCtx.save();
      maskCtx.translate(position.x, position.y);
      maskCtx.rotate(item.rotation || 0);
      maskCtx.drawImage(image, -size.width / 2, -size.height / 2, size.width, size.height);
      maskCtx.restore();
    });

    return maskCanvas;
  },

  pointInMask(maskCanvas, x, y, threshold = 10) {
    const safeX = Math.round(Utils.clamp(x, 0, maskCanvas.width - 1));
    const safeY = Math.round(Utils.clamp(y, 0, maskCanvas.height - 1));
    const alpha = maskCanvas.getContext('2d').getImageData(safeX, safeY, 1, 1).data[3];
    return alpha >= threshold;
  },

  renderMaskedLayer(targetCtx, maskCanvas, renderer) {
    const layerCanvas = document.createElement('canvas');
    layerCanvas.width = maskCanvas.width;
    layerCanvas.height = maskCanvas.height;
    const layerCtx = layerCanvas.getContext('2d');
    renderer(layerCtx);
    layerCtx.globalCompositeOperation = 'destination-in';
    layerCtx.drawImage(maskCanvas, 0, 0);
    targetCtx.drawImage(layerCanvas, 0, 0);
  },

  normalizeStoredPoint(point) {
    if (point && typeof point.nx === 'number' && typeof point.ny === 'number') {
      return { nx: point.nx, ny: point.ny };
    }

    const rx = point && typeof point.rx === 'number' ? point.rx : 0;
    const ry = point && typeof point.ry === 'number' ? point.ry : 0;
    return {
      nx: 0.5 + rx * 0.5,
      ny: 0.5 + ry * 0.5,
    };
  },

  getFramePoint(frame, point) {
    const normalized = Utils.normalizeStoredPoint(point);
    return {
      x: frame.x + normalized.nx * frame.width,
      y: frame.y + normalized.ny * frame.height,
    };
  },

  getDecorationPosition(item, frame) {
    if (item && typeof item.nx === 'number' && typeof item.ny === 'number') {
      return {
        x: frame.x + item.nx * frame.width,
        y: frame.y + item.ny * frame.height,
      };
    }

    const rx = item && typeof item.rx === 'number' ? item.rx : 0;
    const ry = item && typeof item.ry === 'number' ? item.ry : 0;
    return {
      x: frame.x + frame.width * (0.5 + rx * 0.5),
      y: frame.y + frame.height * (0.5 + ry * 0.5),
    };
  },

  getCakeBasePath(cakeType = 'single') {
    if (cakeType === 'double') {
      return CONFIG.doubleCakePreview;
    }
    return 'cake/bases/single/base';
  },

  getCreamCakePath(cakeType = 'single', creamColor = CONFIG.creamColors[0]) {
    if (!creamColor) {
      return Utils.getCakeBasePath(cakeType);
    }
    if (cakeType === 'double') {
      return creamColor.doubleCakeSrc || Utils.getCakeBasePath(cakeType);
    }
    return creamColor.singleCakeSrc || Utils.getCakeBasePath(cakeType);
  },

  async loadCakeLayers(cakeType = 'single', options = {}) {
    const {
      coated = true,
      creamColor = App.state?.creamColor || CONFIG.creamColors[0],
    } = options;

    const targetPath = coated
      ? Utils.getCreamCakePath(cakeType, creamColor)
      : Utils.getCakeBasePath(cakeType);

    try {
      return [await Utils.loadImage(targetPath)];
    } catch (error) {
      if (!coated) {
        throw error;
      }

      const fallbackPath = Utils.getCakeBasePath(cakeType);
      console.warn('cream cake image missing, fallback to base', targetPath, error);
      return [await Utils.loadImage(fallbackPath)];
    }
  },

  async loadDecorationImagesForState(decorations = []) {
    const images = new Map();
    const uniqueSrc = [...new Set(decorations.map((item) => item.src).filter(Boolean))];
    await Promise.all(uniqueSrc.map(async (src) => {
      try {
        const image = await Utils.loadImage(src);
        images.set(src, image);
      } catch (error) {
        console.warn('decoration image missing', src, error);
      }
    }));
    return images;
  },

  drawCakeArtwork(ctx, options = {}) {
    const {
      layout,
      maskCanvas,
      creamColor,
      fillCreamOverlay = false,
      strokes = [],
      creamStrokes = [],
      creamStampImages = new Map(),
      decorations = [],
      decorationImages = new Map(),
      drawBase = true,
    } = options;

    if (!layout || !maskCanvas) {
      return;
    }

    if (drawBase) {
      Utils.drawCakeLayers(ctx, layout);
    }

    if (fillCreamOverlay && creamColor) {
      Utils.renderMaskedLayer(ctx, maskCanvas, (layerCtx) => {
        layerCtx.fillStyle = creamColor.css;
        layerCtx.globalAlpha = 0.6;
        layerCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      });
    }

    if (creamStrokes.length > 0) {
      Utils.renderMaskedLayer(ctx, maskCanvas, (layerCtx) => {
        creamStrokes.forEach((stroke) => {
          if (!stroke.points || stroke.points.length < 2) {
            return;
          }
          const stampImg = creamStampImages.get(stroke.stampSrc);
          if (!stampImg) {
            return;
          }
          const absolutePoints = stroke.points.map((point) => Utils.getFramePoint(layout.frame, point));
          Utils.drawCreamStampStroke(layerCtx, absolutePoints, {
            stampImg,
            opacity: stroke.opacity,
            width: stroke.width,
            seed: stroke.seed,
          });
        });
      });
    }

    Utils.renderMaskedLayer(ctx, maskCanvas, (layerCtx) => {
      strokes.forEach((stroke) => {
        if (!stroke.points || stroke.points.length < 2) {
          return;
        }
        const absolutePoints = stroke.points.map((point) => Utils.getFramePoint(layout.frame, point));
        const drawFn = stroke.type === 'crayon' ? Utils.drawCrayonStroke : Utils.drawCreamStroke;
        drawFn(layerCtx, absolutePoints, {
          color: stroke.color,
          opacity: stroke.opacity,
          width: stroke.width,
          seed: stroke.seed,
        });
      });
    });

    decorations.forEach((item) => {
      const image = decorationImages.get(item.src);
      if (!image) {
        return;
      }
      const position = Utils.getDecorationPosition(item, layout.frame);
      const size = Utils.getDecorationRenderSize(image, layout.frame, item.scale || 0.18);
      ctx.save();
      ctx.translate(position.x, position.y);
      ctx.rotate(item.rotation || 0);
      ctx.drawImage(image, -size.width / 2, -size.height / 2, size.width, size.height);
      ctx.restore();
    });
  },

  drawCreamStroke(ctx, points, options) {
    if (!points || points.length < 2) {
      return;
    }

    const width = Math.max(8, options.width * 0.94);
    const opacity = Utils.clamp(options.opacity, 0.18, 1);
    const color = options.color;
    const seed = options.seed || 1;

    ctx.save();

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = Utils.hexToRgba(color, opacity * 0.32);
    ctx.shadowBlur = width * 0.28;
    ctx.shadowOffsetY = Math.max(1, width * 0.05);
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.strokeStyle = Utils.hexToRgba(color, opacity * 0.9);
    ctx.lineWidth = width * 0.88;
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.strokeStyle = Utils.hexToRgba('#FFFDF8', opacity * 0.14);
    ctx.lineWidth = Math.max(2, width * 0.34);
    ctx.stroke();

    for (let index = 1; index < points.length; index += 1) {
      const prev = points[index - 1];
      const point = points[index];
      const segmentLength = Math.hypot(point.x - prev.x, point.y - prev.y);
      const spacing = Math.max(6, width * 0.28);
      const stepCount = Math.max(1, Math.floor(segmentLength / spacing));
      const angle = Math.atan2(point.y - prev.y, point.x - prev.x);

      for (let step = 0; step <= stepCount; step += 1) {
        const progress = step / stepCount;
        const centerX = prev.x + (point.x - prev.x) * progress;
        const centerY = prev.y + (point.y - prev.y) * progress;
        const noise = Utils.seededNoise(seed + index * 7, step + 1);
        const blobWidth = width * (0.76 + noise * 0.08);
        const blobHeight = width * (0.46 + noise * 0.04);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + noise * 0.08);

        ctx.fillStyle = Utils.hexToRgba(color, opacity * 0.96);
        ctx.beginPath();
        ctx.ellipse(0, 0, blobWidth * 0.58, blobHeight * 0.54, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = Utils.hexToRgba('#FFFDF8', opacity * 0.26);
        ctx.lineWidth = Math.max(1.2, width * 0.075);
        ctx.beginPath();
        ctx.moveTo(-blobWidth * 0.22, -blobHeight * 0.06);
        ctx.quadraticCurveTo(0, -blobHeight * 0.34, blobWidth * 0.22, -blobHeight * 0.06);
        ctx.stroke();

        ctx.strokeStyle = Utils.hexToRgba('#5C4033', opacity * 0.06);
        ctx.lineWidth = Math.max(1, width * 0.05);
        ctx.beginPath();
        ctx.moveTo(-blobWidth * 0.18, blobHeight * 0.16);
        ctx.quadraticCurveTo(0, blobHeight * 0.3, blobWidth * 0.18, blobHeight * 0.16);
        ctx.stroke();

        ctx.restore();
      }
    }

    ctx.restore();
  },

  drawCrayonStroke(ctx, points, options) {
    if (!points || points.length < 2) {
      return;
    }

    const width = Math.max(4, options.width * 0.94);
    const opacity = Utils.clamp(options.opacity, 0.18, 1);
    const color = options.color;
    const seed = options.seed || 1;

    ctx.save();

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let layer = 0; layer < 3; layer += 1) {
      const layerOpacity = layer === 0 ? opacity * 0.55 : layer === 1 ? opacity * 0.35 : opacity * 0.18;
      const layerWidth = layer === 0 ? width : layer === 1 ? width * 0.72 : width * 1.12;
      const noiseAmp = layer === 2 ? 0.6 : 0.3;

      ctx.beginPath();
      points.forEach((point, index) => {
        const noise = Utils.seededNoise(seed + layer * 31, index * 3 + layer) * width * noiseAmp * 0.12;
        const px = point.x + noise;
        const py = point.y + noise * 0.8;
        if (index === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      });
      ctx.strokeStyle = Utils.hexToRgba(color, layerOpacity);
      ctx.lineWidth = layerWidth;
      ctx.stroke();
    }

    for (let index = 1; index < points.length; index += 1) {
      const prev = points[index - 1];
      const point = points[index];
      const segmentLength = Math.hypot(point.x - prev.x, point.y - prev.y);
      const spacing = Math.max(3, width * 0.18);
      const stepCount = Math.max(1, Math.floor(segmentLength / spacing));

      for (let step = 0; step <= stepCount; step += 1) {
        const progress = step / stepCount;
        const cx = prev.x + (point.x - prev.x) * progress;
        const cy = prev.y + (point.y - prev.y) * progress;
        const noise = Utils.seededNoise(seed + index * 7, step + 1);
        const grainSize = width * (0.08 + Math.abs(noise) * 0.14);

        ctx.fillStyle = Utils.hexToRgba(color, opacity * (0.12 + Math.abs(noise) * 0.16));
        ctx.fillRect(
          cx + noise * width * 0.2,
          cy + Utils.seededNoise(seed + step, index) * width * 0.2,
          grainSize,
          grainSize * (0.6 + Math.abs(noise) * 0.5),
        );
      }
    }

    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.strokeStyle = Utils.hexToRgba('#FFFFFF', opacity * 0.08);
    ctx.lineWidth = Math.max(1, width * 0.18);
    ctx.stroke();

    ctx.restore();
  },

  drawCreamStampStroke(ctx, points, options) {
    if (!points || points.length < 2 || !options.stampImg) {
      return;
    }

    const width = Math.max(8, options.width * 0.94);
    const opacity = Utils.clamp(options.opacity, 0.18, 1);
    const seed = options.seed || 1;
    const stampImg = options.stampImg;
    const stampSize = width * 1.6;

    ctx.save();
    ctx.globalAlpha = opacity;

    for (let index = 1; index < points.length; index += 1) {
      const prev = points[index - 1];
      const point = points[index];
      const segmentLength = Math.hypot(point.x - prev.x, point.y - prev.y);
      const spacing = Math.max(stampSize * 0.6, width * 0.8);
      const stepCount = Math.max(1, Math.ceil(segmentLength / spacing));
      const angle = Math.atan2(point.y - prev.y, point.x - prev.x);

      for (let step = 0; step <= stepCount; step += 1) {
        const progress = step / stepCount;
        const cx = prev.x + (point.x - prev.x) * progress;
        const cy = prev.y + (point.y - prev.y) * progress;
        const noise = Utils.seededNoise(seed + index * 7, step + 1);
        const size = stampSize * (0.88 + noise * 0.12);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle + noise * 0.15);
        ctx.drawImage(stampImg, -size / 2, -size / 2, size, size);
        ctx.restore();
      }
    }

    if (points.length >= 2) {
      const last = points[points.length - 1];
      const size = stampSize * 0.92;
      ctx.drawImage(stampImg, last.x - size / 2, last.y - size / 2, size, size);
    }

    ctx.restore();
  },

  hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  },

  adjustBrightness(hex, brightness) {
    const safe = hex.replace('#', '');
    const r = parseInt(safe.substring(0, 2), 16);
    const g = parseInt(safe.substring(2, 4), 16);
    const b = parseInt(safe.substring(4, 6), 16);
    const factor = brightness / 72;
    const adjust = (c) => Math.min(255, Math.max(0, Math.round(c * factor)));
    const rr = adjust(r).toString(16).padStart(2, '0');
    const gg = adjust(g).toString(16).padStart(2, '0');
    const bb = adjust(b).toString(16).padStart(2, '0');
    return `#${rr}${gg}${bb}`;
  },

  drawColorSlider(canvas, thumbEl, currentColor, onChange) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    const steps = 12;
    for (let i = 0; i <= steps; i += 1) {
      const hue = (i / steps) * 360;
      gradient.addColorStop(i / steps, `hsl(${hue}, 65%, 72%)`);
    }
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    const radius = h / 2;
    ctx.moveTo(radius, 0);
    ctx.lineTo(w - radius, 0);
    ctx.arc(w - radius, radius, radius, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(radius, h);
    ctx.arc(radius, radius, radius, Math.PI / 2, -Math.PI / 2);
    ctx.closePath();
    ctx.fill();

    const findHueFromHex = (hex) => {
      const safe = hex.replace('#', '');
      const r = parseInt(safe.substring(0, 2), 16) / 255;
      const g = parseInt(safe.substring(2, 4), 16) / 255;
      const b = parseInt(safe.substring(4, 6), 16) / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const d = max - min;
      if (d === 0) return 0;
      let hue;
      if (max === r) hue = ((g - b) / d) % 6;
      else if (max === g) hue = (b - r) / d + 2;
      else hue = (r - g) / d + 4;
      hue = Math.round(hue * 60);
      if (hue < 0) hue += 360;
      return hue;
    };

    const updateThumb = (hue) => {
      const x = (hue / 360) * w;
      thumbEl.style.left = `${x}px`;
      thumbEl.style.background = `hsl(${hue}, 65%, 72%)`;
    };

    const initialHue = findHueFromHex(currentColor);
    updateThumb(initialHue);

    let dragging = false;

    const handleMove = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      const x = Utils.clamp(clientX - rect.left, 0, rect.width);
      const hue = (x / rect.width) * 360;
      updateThumb(hue);
      const hex = Utils.hslToHex(hue, 65, 72);
      onChange(hex);
    };

    const onPointerDown = (e) => {
      e.preventDefault();
      dragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      handleMove(clientX);

      const onPointerMove = (moveEvent) => {
        if (!dragging) return;
        moveEvent.preventDefault();
        const cx = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
        handleMove(cx);
      };
      const onPointerUp = () => {
        dragging = false;
        document.removeEventListener('mousemove', onPointerMove);
        document.removeEventListener('touchmove', onPointerMove);
        document.removeEventListener('mouseup', onPointerUp);
        document.removeEventListener('touchend', onPointerUp);
      };
      document.addEventListener('mousemove', onPointerMove, { passive: false });
      document.addEventListener('touchmove', onPointerMove, { passive: false });
      document.addEventListener('mouseup', onPointerUp);
      document.addEventListener('touchend', onPointerUp);
    };

    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('touchstart', onPointerDown, { passive: false });

    return {
      setColor(hex) {
        updateThumb(findHueFromHex(hex));
      },
    };
  },
};
