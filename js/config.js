/**
 * 全局配置 - 素材路径、颜色、常量
 */
const CONFIG = {
  // 寿星信息（修改此处即可自定义）
  birthday: {
    name: '寿星',
    date: '2026.05.30',
    theme: '春尽夏生',
  },

  // 图片基础路径
  imgBase: 'assets/images/',

  // 奶油颜色（色卡）—— 仅列出已有素材的 6 种
  creamColors: [
    { id: 'white', name: '奶白', hex: '#FFF8F0', css: 'rgba(255,248,240,0.95)', src: 'making/ingredients/food_coloring_bottles/white', singleCakeSrc: 'cake/bases/single/creamsingle/cream_01', doubleCakeSrc: 'cake/bases/double/cream/cream_01' },
    { id: 'light_pink', name: '淡粉', hex: '#FFD6DC', css: 'rgba(255,214,220,0.9)', src: 'making/ingredients/food_coloring_bottles/light_pink', singleCakeSrc: 'cake/bases/single/creamsingle/cream_02', doubleCakeSrc: 'cake/bases/double/cream/cream_02' },
    { id: 'peach_pink', name: '蜜桃粉', hex: '#FFB5A7', css: 'rgba(255,181,167,0.9)', src: 'making/ingredients/food_coloring_bottles/peach_pink', singleCakeSrc: 'cake/bases/single/creamsingle/cream_03', doubleCakeSrc: 'cake/bases/double/cream/cream_03' },
    { id: 'light_taro', name: '淡芋紫', hex: '#D8B4E2', css: 'rgba(216,180,226,0.9)', src: 'making/ingredients/food_coloring_bottles/light_taro', singleCakeSrc: 'cake/bases/single/creamsingle/cream_04', doubleCakeSrc: 'cake/bases/double/cream/cream_04' },
    { id: 'lavender', name: '薰衣草紫', hex: '#C3A6D8', css: 'rgba(195,166,216,0.9)', src: 'making/ingredients/food_coloring_bottles/lavender', singleCakeSrc: 'cake/bases/single/creamsingle/cream_05', doubleCakeSrc: 'cake/bases/double/cream/cream_05' },
    { id: 'mint_green', name: '薄荷绿', hex: '#A8E6CF', css: 'rgba(168,230,207,0.9)', src: 'making/ingredients/food_coloring_bottles/mint_green', singleCakeSrc: 'cake/bases/single/creamsingle/cream_06', doubleCakeSrc: 'cake/bases/double/cream/cream_06' },
  ],

  editorColors: [
    '#FFF8F0',
    '#FFD6DC',
    '#FFB5A7',
    '#D8B4E2',
    '#A8E6CF',
    '#F4D06F',
    '#C97B63',
    '#8B5A2B',
    '#6B4EFF',
  ],

  doubleCakePreview: 'cake/bases/double/preview',

  // 火焰图片 (单张, 不做动画)
  flameSrc: 'ceremony/candle_flames/lit/flame_04',

  // 装饰元素分类
  decorations: {
    candles: [
      // 迷你蜡烛 (6 个正式素材)
      { id: 'mini_01', name: '迷你蜡烛1', src: 'decorations/candles/mini/candle_01', isCandle: true },
      { id: 'mini_02', name: '迷你蜡烛2', src: 'decorations/candles/mini/candle_02', isCandle: true },
      { id: 'mini_03', name: '迷你蜡烛3', src: 'decorations/candles/mini/candle_03', isCandle: true },
      { id: 'mini_04', name: '迷你蜡烛4', src: 'decorations/candles/mini/candle_04', isCandle: true },
      { id: 'mini_05', name: '迷你蜡烛5', src: 'decorations/candles/mini/candle_05', isCandle: true },
      { id: 'mini_06', name: '迷你蜡烛6', src: 'decorations/candles/mini/candle_06', isCandle: true },
      // 细长蜡烛 (9 个正式素材)
      { id: 'slim_01', name: '细长蜡烛1', src: 'decorations/candles/slim/candle_01', isCandle: true },
      { id: 'slim_02', name: '细长蜡烛2', src: 'decorations/candles/slim/candle_02', isCandle: true },
      { id: 'slim_03', name: '细长蜡烛3', src: 'decorations/candles/slim/candle_03', isCandle: true },
      { id: 'slim_04', name: '细长蜡烛4', src: 'decorations/candles/slim/candle_04', isCandle: true },
      { id: 'slim_05', name: '细长蜡烛5', src: 'decorations/candles/slim/candle_05', isCandle: true },
      { id: 'slim_06', name: '细长蜡烛6', src: 'decorations/candles/slim/candle_06', isCandle: true },
      { id: 'slim_07', name: '细长蜡烛7', src: 'decorations/candles/slim/candle_07', isCandle: true },
      { id: 'slim_08', name: '细长蜡烛8', src: 'decorations/candles/slim/candle_08', isCandle: true },
      { id: 'slim_09', name: '细长蜡烛9', src: 'decorations/candles/slim/candle_09', isCandle: true },
      // 数字蜡烛 (0-9 正式素材)
      { id: 'num_0', name: '数字0', src: 'decorations/candles/number/num_0', isCandle: true },
      { id: 'num_1', name: '数字1', src: 'decorations/candles/number/num_1', isCandle: true },
      { id: 'num_2', name: '数字2', src: 'decorations/candles/number/num_2', isCandle: true },
      { id: 'num_3', name: '数字3', src: 'decorations/candles/number/num_3', isCandle: true },
      { id: 'num_4', name: '数字4', src: 'decorations/candles/number/num_4', isCandle: true },
      { id: 'num_5', name: '数字5', src: 'decorations/candles/number/num_5', isCandle: true },
      { id: 'num_6', name: '数字6', src: 'decorations/candles/number/num_6', isCandle: true },
      { id: 'num_7', name: '数字7', src: 'decorations/candles/number/num_7', isCandle: true },
      { id: 'num_8', name: '数字8', src: 'decorations/candles/number/num_8', isCandle: true },
      { id: 'num_9', name: '数字9', src: 'decorations/candles/number/num_9', isCandle: true },
    ],
    fruits: [
      { id: 'strawberry', name: '草莓', src: 'decorations/fruits/strawberry/strawberry' },
      { id: 'blueberry', name: '蓝莓', src: 'decorations/fruits/blueberry/blueberry' },
      { id: 'green_grape', name: '青提', src: 'decorations/fruits/green_grape/green_grape' },
      { id: 'mango_slice', name: '芒果片', src: 'decorations/fruits/mango_slice/mango_slice' },
      { id: 'kiwi_slice', name: '猕猴桃片', src: 'decorations/fruits/kiwi_slice/kiwi_slice' },
      { id: 'raspberry', name: '树莓', src: 'decorations/fruits/raspberry/raspberry' },
      { id: 'white_peach', name: '白桃片', src: 'decorations/fruits/white_peach_slice/white_peach' },
      { id: 'sugar_gold', name: '金色糖珠', src: 'decorations/sweets/sugar_beads_gold/sugar_gold' },
      { id: 'sugar_silver', name: '银色糖珠', src: 'decorations/sweets/sugar_beads_silver/sugar_silver' },
      { id: 'choco_stick', name: '巧克力棒', src: 'decorations/sweets/chocolate_stick/default', placeholder: true },
      { id: 'heart_choco', name: '爱心巧克力', src: 'decorations/sweets/heart_chocolate/default', placeholder: true },
    ],
    toppers: [
      { id: 'daisy', name: '小雏菊', src: 'decorations/toppers/flowers/daisy/default', placeholder: true },
      { id: 'jasmine', name: '茉莉花瓣', src: 'decorations/toppers/flowers/jasmine_petals/jasmine' },
      { id: 'lily', name: '铃兰', src: 'decorations/toppers/flowers/lily_of_the_valley/default', placeholder: true },
      { id: 'heart', name: '爱心', src: 'decorations/toppers/shapes/heart/default', placeholder: true },
      { id: 'star', name: '星星', src: 'decorations/toppers/shapes/star/default', placeholder: true },
      { id: 'moon', name: '月亮', src: 'decorations/toppers/shapes/moon/default', placeholder: true },
      { id: 'bow', name: '蝴蝶结', src: 'decorations/toppers/ribbons/bow/default', placeholder: true },
      { id: 'hb_plaque', name: 'HB插牌', src: 'decorations/toppers/plaques/happy_birthday/default', placeholder: true },
      { id: 'cjxs_plaque', name: '春尽夏生插牌', src: 'decorations/toppers/plaques/chun_jin_xia_sheng/default', placeholder: true },
    ],
  },

  // 蛋糕切割
  maxCutPieces: 8,
  cutLineMinPoints: 3,     // 降低最少点数门槛 (原为 6)
  cutLineWidth: 0.032,     // 切割线宽度系数 (原为 0.022)

  // 打发奶油需要的圆周数
  whipRounds: 3,

  // 相册最大存储数
  albumMaxItems: 20,
};
