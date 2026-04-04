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
    if (e.touches && e.touches.length > 0) {
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

  createMaskCanvas(width, height, layout) {
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext('2d');
    Utils.drawCakeLayers(maskCtx, layout);
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

    Utils.renderMaskedLayer(ctx, maskCanvas, (layerCtx) => {
      strokes.forEach((stroke) => {
        if (!stroke.points || stroke.points.length < 2) {
          return;
        }
        const absolutePoints = stroke.points.map((point) => Utils.getFramePoint(layout.frame, point));
        Utils.drawCrayonStroke(layerCtx, absolutePoints, {
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
      const size = layout.frame.width * (item.scale || 0.18);
      ctx.save();
      ctx.translate(position.x, position.y);
      ctx.rotate(item.rotation || 0);
      ctx.drawImage(image, -size / 2, -size / 2, size, size);
      ctx.restore();
    });
  },

  drawCrayonStroke(ctx, points, options) {
    if (!points || points.length < 2) {
      return;
    }

    const width = options.width;
    const opacity = options.opacity;
    const color = options.color;
    const seed = options.seed || 1;
    const passes = 4;

    for (let pass = 0; pass < passes; pass += 1) {
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = Utils.hexToRgba(color, opacity * (pass === 0 ? 0.38 : 0.18));
      ctx.lineWidth = Math.max(1, width * (pass === 0 ? 1 : 0.72));

      points.forEach((point, index) => {
        const offsetScale = pass === 0 ? 0 : width * 0.08;
        const jitterX = offsetScale * Utils.seededNoise(seed + pass, index * 2 + 1);
        const jitterY = offsetScale * Utils.seededNoise(seed + pass, index * 2 + 2);
        const x = point.x + jitterX;
        const y = point.y + jitterY;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    ctx.save();
    ctx.fillStyle = Utils.hexToRgba(color, opacity * 0.08);
    for (let index = 0; index < points.length; index += 2) {
      const point = points[index];
      const radius = Math.max(1, width * 0.06);
      const grainX = point.x + Utils.seededNoise(seed, index + 17) * width * 0.12;
      const grainY = point.y + Utils.seededNoise(seed, index + 23) * width * 0.12;
      ctx.beginPath();
      ctx.arc(grainX, grainY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },
};
