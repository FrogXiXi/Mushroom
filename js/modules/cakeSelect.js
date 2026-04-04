/**
 * 模块2: 蛋糕胚选择
 */
const CakeSelectModule = {
  selected: 'single',

  init() {
    const options = document.querySelectorAll('.cake-option');
    const nextBtn = document.getElementById('cake-select-next');
    this.selected = App.state.cakeType || 'single';

    options.forEach((opt) => {
      opt.classList.toggle('selected', opt.dataset.cake === this.selected);
    });

    options.forEach((opt) => {
      opt.onclick = () => {
        options.forEach((item) => item.classList.remove('selected'));
        opt.classList.add('selected');
        this.selected = opt.dataset.cake;
        App.state.cakeType = this.selected;
        App.saveState();
      };
    });

    nextBtn.onclick = () => {
      App.state.cakeType = this.selected;
      App.saveState();
      App.goTo('mod-cream-making');
    };
  },

  destroy() {},
};
