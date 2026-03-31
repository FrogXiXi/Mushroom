# Hello Kitty蜡笔风沉浸式生日互动派对网站

一个基于原生 HTML、CSS、JavaScript 开发的静态生日互动网站。项目围绕“点亮蜡烛 → 许愿吹蜡烛 → 狂欢留存 → 分享贺卡”的完整仪式流程设计，支持本地直接打开运行，也可以直接部署到 GitHub Pages。

## 项目特点

- 纯前端实现，无需构建工具、无需 npm install、无需后端
- 参考项目根目录 refer.png 的蜡笔手绘风格进行布局与配色设计
- 支持寿星姓名、年龄数字蜡烛、头像蜡笔描边、主题色切换
- 使用 Web Audio API + AnalyserNode 实现麦克风吹蜡烛识别
- 自动提供长按吹蜡烛备用模式，拒绝麦克风权限也不会中断流程
- 支持留言墙、蛋糕 DIY、分享链接、电子贺卡导出
- 所有素材均使用语义化命名的占位资源，后续可直接覆盖同名文件替换

## 目录结构

```text
zzhappy_day/
├── index.html
├── refer.png
├── README.md
├── .gitignore
└── assets/
    ├── css/
    │   └── main.css
    ├── js/
    │   ├── audio.js
    │   ├── interaction.js
    │   └── utils.js
    ├── images/
    │   ├── background/
    │   ├── cake/
    │   ├── characters/
    │   └── decor/
    └── audio/
```

## 快速开始

1. 克隆或下载仓库到本地。
2. 直接双击打开 index.html，或使用浏览器打开该文件。
3. 首次进入后填写寿星姓名，点击“开启生日派对”。
4. 按照页面提示从中间到两侧点亮蜡烛。
5. 全亮后允许麦克风权限并吹蜡烛，或直接切换为长按吹烛模式。

## 核心功能说明

### 1. 吹蜡烛识别

- 使用 Web Audio API + AnalyserNode 做频谱分析
- 采用 80-300Hz 低频能量、低频占比、持续时长三重条件判断
- 启动时自动采集 2 秒环境底噪进行阈值校准
- 麦克风不可用时自动切换为长按吹蜡烛模式

### 2. 生日定制

- 寿星姓名会同步更新顶部生日标题
- 年龄会生成数字蜡烛，并在吹蜡烛时优先熄灭
- 上传头像后会在前端 Canvas 中转成蜡笔描边头像
- 主题色支持粉色、蓝色、黄色三套切换

### 3. 派对扩展

- 左侧导航包含 PARTY INVITE、CAKE DECORATING、GAMES & FUN、GUESTBOOK、GIFT SHOP
- 留言墙内容、定制信息、DIY 数据会编码进 URL 哈希
- 支持 html2canvas 生成生日贺卡 PNG
- 支持全局拖尾、点击烟花、狂欢彩带和性能降级

## 📝 素材替换教程

本项目所有占位素材都采用“固定文件名 + 固定相对路径”的方式组织。后续替换时，只需要用你的新素材覆盖同名文件，不需要改动 HTML、CSS 或 JavaScript 代码。

### 1. 角色素材替换

- 路径：assets/images/characters/
- 主要文件：hello-kitty-main.svg、bear-buddy.svg、puppy-buddy.svg、kitty-friend.svg、bunny-buddy.svg
- 建议尺寸：180px 到 340px，透明底 SVG 或 PNG
- 用途：主视觉角色、小动物伙伴、加载页角色

替换步骤：

1. 准备透明底角色素材。
2. 保持原文件名不变。
3. 直接覆盖 assets/images/characters/ 下对应文件。
4. 刷新页面即可生效。

### 2. 蛋糕与蜡烛素材替换

- 路径：assets/images/cake/
- 主要文件：cake-cream-default.svg、cake-chocolate.svg、cake-mango.svg、candle-lit.svg、candle-unlit.svg、number-candle.svg
- 建议尺寸：蛋糕 440x300px，蜡烛 96x220px，透明底 SVG 或 PNG
- 用途：蛋糕主体换肤、蜡烛视觉替换、年龄数字蜡烛占位

替换步骤：

1. 按照不同蛋糕口味准备三张对应素材。
2. 如需只替换默认蛋糕，只覆盖 cake-cream-default.svg 即可。
3. 如需一起替换动态蜡烛视觉，可同时覆盖 candle-lit.svg、candle-unlit.svg、number-candle.svg。

### 3. 装饰与背景素材替换

- 路径：assets/images/decor/ 和 assets/images/background/
- 主要文件：party-bunting.svg、balloon-cluster.svg、bow-sticker.svg、avatar-placeholder.svg、candy-sticker.svg、strawberry-sticker.svg、cherry-sticker.svg、crayon-room.svg、party-illustration.svg
- 建议尺寸：背景 1200x720px，装饰 120px 到 420px，透明底 SVG 或 PNG
- 用途：顶部彩旗、气球、贴纸、房间背景、中央插画

替换步骤：

1. 优先准备 SVG 文件，缩放时更清晰。
2. 如果使用 PNG，请保持透明底并尽量接近原始尺寸。
3. 覆盖相同文件名后刷新页面即可看到新素材。

### 4. 音效素材替换

- 路径：assets/audio/
- 主要文件：candle-light.wav、blow-breath.wav、candle-out.wav、crowd-cheer.wav、piano-loop.wav、happy-birthday-bg.wav、animal-pop.wav、confetti-pop.wav
- 建议格式：WAV 或 MP3，单文件时长建议 0.2 秒到 90 秒之间
- 用途：点蜡烛、吹气、灭烛、欢呼、BGM、生日歌、小动物互动、礼花特效

替换步骤：

1. 保持文件名不变。
2. 用你自己的音频文件覆盖 assets/audio/ 下同名文件。
3. 如果使用 MP3，也可以继续沿用 WAV 文件名，但推荐同步改成相同扩展名后再更新 index.html 中对应引用。

## 数据存储说明

- 愿望内容保存在浏览器 localStorage 中，仅当前设备可见
- 留言墙、主题、姓名、年龄、蛋糕装饰等通过 URL 哈希分享
- 项目不采集、不上传任何用户数据

## 部署到 GitHub Pages

1. 将仓库推送到 GitHub。
2. 打开仓库设置中的 Pages。
3. Source 选择部署分支与根目录。
4. 等待 Pages 构建完成后，访问生成的站点地址。

部署后无需额外配置，所有资源均使用相对路径，适合静态托管。

## 浏览器兼容性

- Chrome、Edge、Safari 主流桌面浏览器
- iOS 13+、Android 10+ 移动端浏览器
- iOS Safari 需要先点击页面中的交互按钮，才能激活音频上下文与麦克风能力

## 开发说明

- 样式文件：assets/css/main.css
- 麦克风与声音逻辑：assets/js/audio.js
- 页面交互与状态管理：assets/js/interaction.js
- 工具函数与哈希编码：assets/js/utils.js

## 版权声明

- Hello Kitty 等三丽鸥 IP 仅限个人非商用使用，禁止商用。
- 仓库内的占位素材均为可替换演示资源，请在正式替换时自行确认版权合规。
- 占位音效为本地生成的演示资源，后续可按上文路径直接替换为你自己的 CC0 或已授权素材。