/**
 * 模块9: 收尾 & 重置
 */
const EndingModule = {
  init() {
    const text = document.getElementById('ending-text');
    const restartBtn = document.getElementById('ending-restart');

    text.innerHTML = App.state.albumReminderPending
      ? '春尽夏生，岁岁欢愉，愿你万事顺意，平安喜乐<br>你的“魔法贺卡”有变动了，记得去相册看看，等你想好的时候再拉开它。'
      : '春尽夏生，岁岁欢愉，愿你万事顺意，平安喜乐';

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