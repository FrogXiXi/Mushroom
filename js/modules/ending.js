/**
 * 模块9: 收尾 & 重置
 */
const EndingModule = {
  init() {
    const text = document.getElementById('ending-text');
    const restartBtn = document.getElementById('ending-restart');

    text.innerHTML = '春尽夏生，岁岁欢愉，愿你万事顺意，平安喜乐<br>你的照片发生了一些魔法反应，记得去相册看看。';

    setTimeout(() => {
      text.style.animation = 'fadeInUp 800ms ease forwards';
    }, 500);

    setTimeout(() => {
      restartBtn.classList.remove('hidden');
      restartBtn.style.animation = 'fadeIn 300ms ease forwards';
    }, 3500);

    restartBtn.onclick = () => {
      this._resetAll();
    };
  },

  _resetAll() {
    App.resetState();
    // 回到封面
    App.goTo('mod-cover');
  },

  destroy() {},
};