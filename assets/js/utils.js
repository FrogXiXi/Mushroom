(function () {
  const STORAGE_KEYS = {
    profile: "zzhappy:profile",
    wish: "zzhappy:wish",
    wishes: "zzhappy:wishes",
    dedications: "zzhappy:dedications",
    guestbook: "zzhappy:guestbook",
    eggs: "zzhappy:eggs",
  };

  const THEMES = {
    kitty: { paper: "#fff7ea", accent: "#ff8bb3", ink: "#6a3f2b" },
    pudding: { paper: "#fff9ef", accent: "#8fc6f5", ink: "#5a432f" },
    cinnamon: { paper: "#fff9e8", accent: "#ffd26d", ink: "#6d4c32" },
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function uid(prefix) {
    return [prefix, Math.random().toString(36).slice(2, 8)].join("-");
  }

  function isMobile() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  }

  function safeJsonParse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function toBase64Unicode(text) {
    return btoa(unescape(encodeURIComponent(text)));
  }

  function fromBase64Unicode(text) {
    return decodeURIComponent(escape(atob(text)));
  }

  function encodeHashState(state) {
    return "#" + toBase64Unicode(JSON.stringify(state));
  }

  function decodeHashState(hash) {
    if (!hash || hash === "#") {
      return null;
    }

    try {
      return JSON.parse(fromBase64Unicode(hash.replace(/^#/, "")));
    } catch (error) {
      return null;
    }
  }

  function loadFromLocal(key, fallback) {
    return safeJsonParse(window.localStorage.getItem(key), fallback);
  }

  function saveToLocal(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  function fileToDataUrl(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function loadImage(source) {
    return new Promise(function (resolve, reject) {
      const image = new Image();
      image.onload = function () {
        resolve(image);
      };
      image.onerror = reject;
      image.src = source;
    });
  }

  async function sketchAvatar(source, canvas, themeName) {
    const theme = THEMES[themeName] || THEMES.kitty;
    const image = await loadImage(source);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const crop = Math.min(image.width, image.height);
    const cropX = (image.width - crop) / 2;
    const cropY = (image.height - crop) / 2;

    canvas.width = 240;
    canvas.height = 240;
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = theme.paper;
    context.beginPath();
    context.arc(120, 120, 112, 0, Math.PI * 2);
    context.fill();

    context.save();
    context.beginPath();
    context.arc(120, 120, 100, 0, Math.PI * 2);
    context.clip();

    // 通过多次微偏移叠加边缘，制造蜡笔描边效果。
    context.globalAlpha = 0.16;
    context.filter = "grayscale(0.1) saturate(0.85) contrast(1.06)";
    [-4, -2, 2, 4].forEach(function (offset) {
      context.drawImage(image, cropX, cropY, crop, crop, 20 + offset, 20 - offset, 200, 200);
      context.drawImage(image, cropX, cropY, crop, crop, 20 - offset, 20 + offset, 200, 200);
    });

    context.globalAlpha = 1;
    context.filter = "saturate(0.88) contrast(1.08)";
    context.drawImage(image, cropX, cropY, crop, crop, 20, 20, 200, 200);
    context.filter = "none";

    for (let index = 0; index < 260; index += 1) {
      context.strokeStyle = index % 2 === 0 ? "rgba(106,63,43,0.08)" : "rgba(255,255,255,0.12)";
      context.lineWidth = randomBetween(0.6, 1.4);
      context.beginPath();
      context.moveTo(randomBetween(26, 214), randomBetween(26, 214));
      context.lineTo(randomBetween(26, 214), randomBetween(26, 214));
      context.stroke();
    }

    context.restore();

    context.strokeStyle = theme.ink;
    context.lineWidth = 6;
    context.beginPath();
    context.arc(120, 120, 102, 0, Math.PI * 2);
    context.stroke();

    return canvas.toDataURL("image/jpeg", 0.72);
  }

  function downloadDataUrl(filename, dataUrl) {
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  function downloadTextFile(filename, text, mimeType) {
    const blob = new Blob([text], { type: mimeType || "text/plain;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    downloadDataUrl(filename, objectUrl);
    window.setTimeout(function () {
      URL.revokeObjectURL(objectUrl);
    }, 1000);
  }

  function normalizePosition(clientX, clientY, element) {
    const rect = element.getBoundingClientRect();
    return {
      x: clamp((clientX - rect.left) / rect.width, 0.08, 0.92),
      y: clamp((clientY - rect.top) / rect.height, 0.08, 0.92),
    };
  }

  function sanitizeName(value) {
    return (value || "").replace(/\s+/g, " ").trim().slice(0, 16);
  }

  window.BirthdayUtils = {
    STORAGE_KEYS: STORAGE_KEYS,
    THEMES: THEMES,
    clamp: clamp,
    randomBetween: randomBetween,
    uid: uid,
    isMobile: isMobile,
    encodeHashState: encodeHashState,
    decodeHashState: decodeHashState,
    loadFromLocal: loadFromLocal,
    saveToLocal: saveToLocal,
    copyText: copyText,
    fileToDataUrl: fileToDataUrl,
    sketchAvatar: sketchAvatar,
    downloadDataUrl: downloadDataUrl,
    downloadTextFile: downloadTextFile,
    normalizePosition: normalizePosition,
    sanitizeName: sanitizeName,
  };
}());