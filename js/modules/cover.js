/**
 * 模块1: 封面模块
 */
const CoverModule = {
  init() {
    const title = document.getElementById('cover-title');
    const subtitle = document.getElementById('cover-subtitle');
    const btn = document.getElementById('cover-enter-btn');
    const versionEl = document.getElementById('cover-version');

    const { name, date, theme } = CONFIG.birthday;
    subtitle.textContent = `To ${name} · Happy Birthday · ${date}`;

    if (versionEl) {
      versionEl.textContent = `v${CONFIG.stateVersion}`;
    }

    this._setupDoodles();

    // 分层淡入动画序列
    // 0ms: 背景淡入 (已由CSS控制)
    // 300ms: 标题淡入+上移
    setTimeout(() => {
      title.style.animation = 'fadeInUp 800ms ease forwards';
    }, 300);
    // 1100ms: 副标题淡入
    setTimeout(() => {
      subtitle.style.animation = 'fadeIn 500ms ease forwards';
    }, 1100);
    // 1600ms: 按钮淡入 + 呼吸动效
    setTimeout(() => {
      btn.style.animation = 'fadeIn 300ms ease forwards';
      setTimeout(() => {
        btn.classList.add('anim-breathe');
      }, 300);
    }, 1600);

    // 点击进入
    btn.addEventListener('click', () => {
      App.goTo('mod-cake-select');
    });
  },

  _setupDoodles() {
    const doodles = document.querySelectorAll('.doodle');
    const doodleSrcs = [
      'style/doodles/doodle_01',
      'style/doodles/doodle_03',
      'style/doodles/doodle_05',
      'style/doodles/doodle_08',
    ];
    doodles.forEach((el, i) => {
      if (doodleSrcs[i]) {
        // 使用 picture 策略
        el.src = CONFIG.imgBase + doodleSrcs[i] + '.webp';
        el.onerror = function () {
          this.src = CONFIG.imgBase + doodleSrcs[i] + '.png';
        };
      }
    });
  },

  destroy() {},
};
