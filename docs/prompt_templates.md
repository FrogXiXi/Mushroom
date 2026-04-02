# 逐素材完整 Prompt 清单（统一蜡笔参考风格）

## 蛋糕主体

### cake/bases/single/base.png
Prompt: isolated single-layer round cake base only, no plate, warm butter-yellow sponge and soft cream tones, simple childlike proportions, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, off-white paper texture, transparent background
Negative: photorealistic, 3d, glossy, vector clean lines, metallic shine, black background, watermark, blur
Settings: Seed=11235813, Size=2048x2048, Sampler=Euler a, Steps=30, CFG=7.2

### cake/plates/single/plate.png
Prompt: round dessert plate seen from slightly above, cream plate with sky-blue rim and raspberry-pink stripe, cute handmade look, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, off-white paper texture, transparent background
Negative: photorealistic, 3d, glossy porcelain, vector clean lines, black background, watermark, blur
Settings: Seed=11235818, Size=2048x2048, Sampler=Euler a, Steps=28, CFG=7.0

### cake/bases/single/outline.png
Prompt: outline-only asset for a single-layer round cake base, no plate, thick slightly uneven crayon contour, childlike hand-drawn line quality, visible wax grain, off-white paper texture feel, transparent background
Negative: photorealistic, 3d, glossy, clean vector lineart, black background, watermark, blur
Settings: Seed=11235814, Size=2048x2048, Sampler=Euler a, Steps=22, CFG=6.4

### cake/bases/single/shadow.png
Prompt: soft crumbly shadow patch for a single-layer round cake base, warm taupe and dusty lavender crayon smudge, childlike hand-colored texture, visible wax grain, transparent background
Negative: photorealistic hard shadow, sharp cast shadow, glossy, black background, watermark, blur
Settings: Seed=11235815, Size=2048x2048, Sampler=Euler a, Steps=24, CFG=6.6

### cake/bases/double/top/base.png
Prompt: isolated top tier for a double-layer round cake, smaller round sponge only, warm butter-yellow and cream tones, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, off-white paper texture, transparent background
Negative: photorealistic, 3d, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=11235816, Size=1536x1536, Sampler=Euler a, Steps=30, CFG=7.2

### cake/bases/double/top/outline.png
Prompt: outline-only asset for the top tier of a double-layer cake, childlike crayon contour, thick slightly uneven line, visible wax grain, transparent background
Negative: photorealistic, 3d, glossy, clean vector lineart, black background, watermark, blur
Settings: Seed=11235819, Size=1536x1536, Sampler=Euler a, Steps=22, CFG=6.4

### cake/bases/double/top/shadow.png
Prompt: soft crumbly shadow patch for the top tier of a double-layer cake, warm taupe crayon smudge, dusty lavender edge tint, transparent background
Negative: photorealistic hard shadow, glossy, black background, watermark, blur
Settings: Seed=11235820, Size=1536x1536, Sampler=Euler a, Steps=24, CFG=6.6

### cake/bases/double/bottom/base.png
Prompt: isolated bottom tier for a double-layer round cake, larger round sponge only, warm butter-yellow and cream tones, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, off-white paper texture, transparent background
Negative: photorealistic, 3d, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=11235817, Size=2048x2048, Sampler=Euler a, Steps=30, CFG=7.2

### cake/bases/double/bottom/outline.png
Prompt: outline-only asset for the bottom tier of a double-layer cake, thick slightly uneven crayon contour, childlike hand-drawn line quality, visible wax grain, transparent background
Negative: photorealistic, 3d, glossy, clean vector lineart, black background, watermark, blur
Settings: Seed=11235821, Size=2048x2048, Sampler=Euler a, Steps=22, CFG=6.4

### cake/bases/double/bottom/shadow.png
Prompt: soft crumbly shadow patch for the bottom tier of a double-layer cake, warm taupe crayon smudge with dusty lavender tint, transparent background
Negative: photorealistic hard shadow, glossy, black background, watermark, blur
Settings: Seed=11235822, Size=2048x2048, Sampler=Euler a, Steps=24, CFG=6.6

## 奶油纹理与叠加

### cake/cream/textures/smooth.png
Prompt: seamless smooth cream texture tile, warm cream and butter-yellow tones, soft rubbed crayon fill with subtle paper tooth and visible wax grain, uneven childlike hand-colored surface, very low-contrast matte finish, gentle diffuse shading only, soft blurred edges for a handmade childlike look, transparent-friendly seamless tile
Negative: photorealistic frosting, glossy highlights, specular shine, oil paint, heavy texture, hard highlights, sharp cast shadows, dark stains, watermark
Settings: Seed=42424242, Size=2048x2048, Sampler=DPM++ 2M Karras, Steps=30, CFG=7.0

### cake/cream/textures/whipped.png
Prompt: seamless whipped cream texture tile, fluffy rounded ridges, warm cream tones with soft pink accents, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, off-white paper texture
Negative: photorealistic frosting, glossy highlights, hard specular shine, dark stains, watermark, blur
Settings: Seed=42424243, Size=2048x2048, Sampler=DPM++ 2M Karras, Steps=30, CFG=7.0

### cake/cream/textures/stroke_soft.png
Prompt: seamless soft cream stroke texture, gentle smeared crayon strokes in cream and pale butter-yellow, visible wax grain and subtle paper tooth, childlike handmade look, soft diffused edges and low-contrast ridges, avoid bright specular highlights, maintain seamless tile for repeatable overlays
Negative: photorealistic frosting, glossy highlights, hard edges, specular shine, oil paint, realistic smear, dark stains, watermark
Settings: Seed=42424244, Size=2048x2048, Sampler=DPM++ 2M Karras, Steps=28, CFG=6.8

### cake/cream/textures/stroke_rich.png
Prompt: seamless rich cream stroke texture, thicker smeared crayon marks in cream, dusty pink and soft caramel tones, visible wax grain and pigment flecks, uneven hand-colored fill with tactile crayon ridges but overall matte finish, reduced specular highlights, warm pastel palette, seamless tile for layering
Negative: photorealistic frosting, glossy highlights, hard edges, oil paint, strong specular shine, metallic sheen, dark stains, watermark
Settings: Seed=42424245, Size=2048x2048, Sampler=DPM++ 2M Karras, Steps=32, CFG=7.1

### cake/cream/overlays/shine.png
Prompt: soft cream highlight overlay only, pale milk-white and butter-yellow crayon smudges, childlike hand-rubbed wax texture, visible grain, transparent background
Negative: photorealistic specular highlight, glossy glare, hard white streaks, black background, watermark, blur
Settings: Seed=42424246, Size=2048x2048, Sampler=Euler a, Steps=24, CFG=6.4

### cake/cream/overlays/rim_highlight.png
Prompt: rim highlight overlay for cake edge only, pale cream and light pink crayon smears, uneven childlike hand-colored texture, visible wax grain, transparent background
Negative: photorealistic specular highlight, glossy glare, hard white streaks, black background, watermark, blur
Settings: Seed=42424247, Size=2048x2048, Sampler=Euler a, Steps=24, CFG=6.4

## 制作流程道具

### making/ingredients/eggs/whole.png
Prompt: whole chicken egg sticker asset, warm off-white shell with a tiny blush of butter yellow, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, off-white paper texture, transparent background
Negative: photorealistic egg, 3d, glossy shell, vector clean lines, black background, watermark, blur
Settings: Seed=20240402, Size=1024x1024, Sampler=Euler a, Steps=24, CFG=6.9

### making/ingredients/eggs/cracked_left.png
Prompt: left half cracked eggshell sticker asset, warm off-white shell, jagged opening, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic egg, glossy shell, vector clean lines, black background, watermark, blur
Settings: Seed=20240403, Size=1024x1024, Sampler=Euler a, Steps=22, CFG=6.7

### making/ingredients/eggs/cracked_right.png
Prompt: right half cracked eggshell sticker asset, warm off-white shell, jagged opening, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic egg, glossy shell, vector clean lines, black background, watermark, blur
Settings: Seed=20240404, Size=1024x1024, Sampler=Euler a, Steps=22, CFG=6.7

### making/ingredients/eggs/yolk.png
Prompt: egg yolk sticker asset, soft golden yellow with a tiny orange center, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic liquid yolk, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=20240405, Size=768x768, Sampler=Euler a, Steps=20, CFG=6.2

### making/ingredients/eggs/shell_piece_01.png
Prompt: small cracked eggshell fragment sticker asset, warm off-white shell chip, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic shell, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=20240406, Size=512x512, Sampler=Euler a, Steps=18, CFG=6.0

### making/ingredients/eggs/shell_piece_02.png
Prompt: small cracked eggshell fragment sticker asset, second variant, warm off-white shell chip, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic shell, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=20240407, Size=512x512, Sampler=Euler a, Steps=18, CFG=6.0

### making/ingredients/food_coloring_bottles/white.png
Prompt: cute dropper bottle sticker asset, creamy white bottle with sky-blue cap ring and raspberry-pink tiny label accent, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, off-white paper texture, transparent background
Negative: photorealistic bottle, glass reflections, metallic parts, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=31415926, Size=768x1024, Sampler=Euler a, Steps=24, CFG=7.0

### making/ingredients/food_coloring_bottles/light_pink.png
Prompt: cute dropper bottle sticker asset, light pink bottle with cream body and sky-blue cap accent, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, off-white paper texture, transparent background
Negative: photorealistic bottle, glass reflections, metallic parts, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=31415927, Size=768x1024, Sampler=Euler a, Steps=24, CFG=7.0

### making/ingredients/food_coloring_bottles/peach_pink.png
Prompt: cute dropper bottle sticker asset, peach pink bottle with cream body and sky-blue cap accent, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, off-white paper texture, transparent background
Negative: photorealistic bottle, glass reflections, metallic parts, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=31415928, Size=768x1024, Sampler=Euler a, Steps=24, CFG=7.0

### making/ingredients/food_coloring_bottles/light_taro.png
Prompt: cute dropper bottle sticker asset, light taro-purple bottle with cream body and sky-blue cap accent, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, off-white paper texture, transparent background
Negative: photorealistic bottle, glass reflections, metallic parts, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=31415929, Size=768x1024, Sampler=Euler a, Steps=24, CFG=7.0

### making/ingredients/food_coloring_bottles/lavender.png
Prompt: cute dropper bottle sticker asset, lavender bottle with cream body and sky-blue cap accent, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, off-white paper texture, transparent background
Negative: photorealistic bottle, glass reflections, metallic parts, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=31415930, Size=768x1024, Sampler=Euler a, Steps=24, CFG=7.0

### making/ingredients/food_coloring_bottles/matcha_green.png
Prompt: cute dropper bottle sticker asset, matcha green bottle with cream body and sky-blue cap accent, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, off-white paper texture, transparent background
Negative: photorealistic bottle, glass reflections, metallic parts, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=31415931, Size=768x1024, Sampler=Euler a, Steps=24, CFG=7.0

### making/ingredients/food_coloring_bottles/mint_green.png
Prompt: cute dropper bottle sticker asset, mint green bottle with cream body and sky-blue cap accent, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, off-white paper texture, transparent background
Negative: photorealistic bottle, glass reflections, metallic parts, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=31415932, Size=768x1024, Sampler=Euler a, Steps=24, CFG=7.0

### making/ingredients/food_coloring_bottles/sea_salt_blue.png
Prompt: cute dropper bottle sticker asset, sea-salt blue bottle with cream body and raspberry-pink tiny label accent, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, off-white paper texture, transparent background
Negative: photorealistic bottle, glass reflections, metallic parts, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=31415933, Size=768x1024, Sampler=Euler a, Steps=24, CFG=7.0

### making/containers/bowl/bowl.png
Prompt: mixing bowl sticker asset, rounded cream bowl with sky-blue rim and tiny raspberry-pink doodle accent, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, off-white paper texture, transparent background
Negative: photorealistic bowl, metallic, glossy ceramic reflections, vector clean lines, black background, watermark, blur
Settings: Seed=50505050, Size=1536x1024, Sampler=Euler a, Steps=24, CFG=6.9

### making/tools/mixer/mixer.png
Prompt: electric mixer sticker asset, butter-yellow mixer body with sky-blue whisk tips and raspberry-pink switch accent, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, off-white paper texture, transparent background
Negative: photorealistic appliance, metallic shine, glossy plastic, vector clean lines, black background, watermark, blur
Settings: Seed=50505051, Size=1536x1024, Sampler=Euler a, Steps=24, CFG=6.9

### making/tools/spatula/spatula.png
Prompt: cake spatula sticker asset, cream handle with sky-blue blade edge and a soft raspberry-pink accent, rounded friendly shape, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic tool, metallic shine, sharp industrial design, vector clean lines, black background, watermark, blur
Settings: Seed=50505052, Size=1024x768, Sampler=Euler a, Steps=22, CFG=6.8

### making/tools/brush/brush.png
Prompt: single wax crayon tool sticker asset, butter-yellow crayon body with sky-blue paper wrap and raspberry-pink tip accent, cute friendly shape, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic brush, glossy plastic, vector clean lines, black background, watermark, blur
Settings: Seed=50505053, Size=768x768, Sampler=Euler a, Steps=20, CFG=6.5

## 动画辅助素材

### making/effects/egg_crack/crack_01.png
Prompt: egg crack effect frame 1 only, short curved crack lines and tiny shell fragments, warm taupe and off-white crayon marks, naive childlike crayon drawing, visible wax grain, transparent background
Negative: photorealistic fracture, sharp realistic shards, glossy, black background, watermark, blur
Settings: Seed=60606061, Size=1024x1024, Sampler=Euler a, Steps=18, CFG=6.0

### making/effects/egg_crack/crack_02.png
Prompt: egg crack effect frame 2 only, more open curved crack lines and small shell fragments, warm taupe and off-white crayon marks, naive childlike crayon drawing, visible wax grain, transparent background
Negative: photorealistic fracture, sharp realistic shards, glossy, black background, watermark, blur
Settings: Seed=60606062, Size=1024x1024, Sampler=Euler a, Steps=18, CFG=6.0

### making/effects/egg_crack/crack_03.png
Prompt: egg crack effect frame 3 only, widest curved crack burst and small shell fragments, warm taupe and off-white crayon marks, naive childlike crayon drawing, visible wax grain, transparent background
Negative: photorealistic fracture, sharp realistic shards, glossy, black background, watermark, blur
Settings: Seed=60606063, Size=1024x1024, Sampler=Euler a, Steps=18, CFG=6.0

### making/effects/color_drop/drop_01.png
Prompt: pastel color drop effect frame 1 only, rounded droplet with soft trailing smear, butter-yellow highlight and sky-blue rim accent, naive childlike crayon drawing, visible wax grain, transparent background
Negative: photorealistic liquid splash, glossy, black background, watermark, blur
Settings: Seed=60606064, Size=512x512, Sampler=Euler a, Steps=18, CFG=6.0

### making/effects/color_drop/drop_02.png
Prompt: pastel color drop effect frame 2 only, slightly stretched droplet with soft trailing smear, butter-yellow highlight and raspberry-pink accent, naive childlike crayon drawing, visible wax grain, transparent background
Negative: photorealistic liquid splash, glossy, black background, watermark, blur
Settings: Seed=60606065, Size=512x512, Sampler=Euler a, Steps=18, CFG=6.0

## 装饰素材

### decorations/candles/slim/white.png
Prompt: slim birthday candle sticker asset, creamy white candle with sky-blue outline accent and tiny warm wick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic candle, glossy wax, vector clean lines, black background, watermark, blur
Settings: Seed=77770001, Size=512x1024, Sampler=Euler a, Steps=22, CFG=6.8

### decorations/candles/slim/pink.png
Prompt: slim birthday candle sticker asset, raspberry-pink candle with cream stripe and tiny warm wick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic candle, glossy wax, vector clean lines, black background, watermark, blur
Settings: Seed=77770002, Size=512x1024, Sampler=Euler a, Steps=22, CFG=6.8

### decorations/candles/slim/blue.png
Prompt: slim birthday candle sticker asset, sky-blue candle with cream stripe and tiny warm wick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic candle, glossy wax, vector clean lines, black background, watermark, blur
Settings: Seed=77770003, Size=512x1024, Sampler=Euler a, Steps=22, CFG=6.8

### decorations/candles/slim/green.png
Prompt: slim birthday candle sticker asset, mint-green candle with cream stripe and tiny warm wick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic candle, glossy wax, vector clean lines, black background, watermark, blur
Settings: Seed=77770004, Size=512x1024, Sampler=Euler a, Steps=22, CFG=6.8

### decorations/candles/slim/gold.png
Prompt: slim birthday candle sticker asset, soft warm gold candle with cream stripe and tiny warm wick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic candle, metallic shine, glossy wax, vector clean lines, black background, watermark, blur
Settings: Seed=77770005, Size=512x1024, Sampler=Euler a, Steps=22, CFG=6.8

### decorations/candles/slim/silver.png
Prompt: slim birthday candle sticker asset, soft silver-gray candle with cream stripe and tiny warm wick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic candle, metallic shine, glossy wax, vector clean lines, black background, watermark, blur
Settings: Seed=77770006, Size=512x1024, Sampler=Euler a, Steps=22, CFG=6.8

### decorations/candles/number/0.png
Prompt: number candle sticker asset shaped like 0, pastel butter-yellow body with sky-blue outline accent and small wick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic candle, glossy wax, vector clean lines, black background, watermark, blur
Settings: Seed=77770100, Size=768x768, Sampler=Euler a, Steps=20, CFG=6.5

### decorations/candles/number/1.png
Prompt: number candle sticker asset shaped like 1, pastel butter-yellow body with sky-blue outline accent and small wick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic candle, glossy wax, vector clean lines, black background, watermark, blur
Settings: Seed=77770101, Size=768x768, Sampler=Euler a, Steps=20, CFG=6.5

### decorations/candles/number/2.png
Prompt: number candle sticker asset shaped like 2, pastel butter-yellow body with sky-blue outline accent and small wick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic candle, glossy wax, vector clean lines, black background, watermark, blur
Settings: Seed=77770102, Size=768x768, Sampler=Euler a, Steps=20, CFG=6.5

### decorations/candles/number/3.png
Prompt: number candle sticker asset shaped like 3, pastel butter-yellow body with sky-blue outline accent and small wick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic candle, glossy wax, vector clean lines, black background, watermark, blur
Settings: Seed=77770103, Size=768x768, Sampler=Euler a, Steps=20, CFG=6.5

### decorations/candles/number/4.png
Prompt: number candle sticker asset shaped like 4, pastel butter-yellow body with sky-blue outline accent and small wick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic candle, glossy wax, vector clean lines, black background, watermark, blur
Settings: Seed=77770104, Size=768x768, Sampler=Euler a, Steps=20, CFG=6.5

### decorations/candles/number/5.png
Prompt: number candle sticker asset shaped like 5, pastel butter-yellow body with sky-blue outline accent and small wick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic candle, glossy wax, vector clean lines, black background, watermark, blur
Settings: Seed=77770105, Size=768x768, Sampler=Euler a, Steps=20, CFG=6.5

### decorations/candles/number/6.png
Prompt: number candle sticker asset shaped like 6, pastel butter-yellow body with sky-blue outline accent and small wick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic candle, glossy wax, vector clean lines, black background, watermark, blur
Settings: Seed=77770106, Size=768x768, Sampler=Euler a, Steps=20, CFG=6.5

### decorations/candles/number/7.png
Prompt: number candle sticker asset shaped like 7, pastel butter-yellow body with sky-blue outline accent and small wick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic candle, glossy wax, vector clean lines, black background, watermark, blur
Settings: Seed=77770107, Size=768x768, Sampler=Euler a, Steps=20, CFG=6.5

### decorations/candles/number/8.png
Prompt: number candle sticker asset shaped like 8, pastel butter-yellow body with sky-blue outline accent and small wick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic candle, glossy wax, vector clean lines, black background, watermark, blur
Settings: Seed=77770108, Size=768x768, Sampler=Euler a, Steps=20, CFG=6.5

### decorations/candles/number/9.png
Prompt: number candle sticker asset shaped like 9, pastel butter-yellow body with sky-blue outline accent and small wick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic candle, glossy wax, vector clean lines, black background, watermark, blur
Settings: Seed=77770109, Size=768x768, Sampler=Euler a, Steps=20, CFG=6.5

### decorations/candles/mini/white.png
Prompt: mini birthday candle sticker asset, creamy white candle with a tiny sky-blue accent and small wick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic candle, glossy wax, vector clean lines, black background, watermark, blur
Settings: Seed=77770201, Size=384x768, Sampler=Euler a, Steps=18, CFG=6.0

### decorations/candles/mini/pink.png
Prompt: mini birthday candle sticker asset, raspberry-pink candle with a tiny cream accent and small wick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic candle, glossy wax, vector clean lines, black background, watermark, blur
Settings: Seed=77770202, Size=384x768, Sampler=Euler a, Steps=18, CFG=6.0

### decorations/candles/mini/blue.png
Prompt: mini birthday candle sticker asset, sky-blue candle with a tiny cream accent and small wick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic candle, glossy wax, vector clean lines, black background, watermark, blur
Settings: Seed=77770203, Size=384x768, Sampler=Euler a, Steps=18, CFG=6.0

### decorations/candles/mini/green.png
Prompt: mini birthday candle sticker asset, mint-green candle with a tiny cream accent and small wick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic candle, glossy wax, vector clean lines, black background, watermark, blur
Settings: Seed=77770204, Size=384x768, Sampler=Euler a, Steps=18, CFG=6.0

### decorations/fruits/strawberry/default.png
Prompt: strawberry sticker asset, simple rounded strawberry with tiny seeds and leafy top, raspberry-pink red body with butter-yellow highlights, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, off-white paper texture, transparent background
Negative: photorealistic fruit, glossy, detailed realism, vector clean lines, black background, watermark, blur
Settings: Seed=88880001, Size=1024x1024, Sampler=Euler a, Steps=24, CFG=6.8

### decorations/fruits/strawberry/half.png
Prompt: half strawberry sticker asset, simple cut strawberry with tiny seeds and soft center, raspberry-pink red body with butter-yellow highlights, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic fruit, glossy, detailed realism, vector clean lines, black background, watermark, blur
Settings: Seed=88880002, Size=1024x1024, Sampler=Euler a, Steps=24, CFG=6.8

### decorations/fruits/blueberry/default.png
Prompt: blueberry sticker asset, simple round blueberry with a tiny crown top, dusty blue body with butter-yellow highlight, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic fruit, glossy, detailed realism, vector clean lines, black background, watermark, blur
Settings: Seed=88880003, Size=768x768, Sampler=Euler a, Steps=20, CFG=6.4

### decorations/fruits/green_grape/default.png
Prompt: green grape sticker asset, small clustered grape shape in mint-green tones with butter-yellow highlight, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic fruit, glossy, detailed realism, vector clean lines, black background, watermark, blur
Settings: Seed=88880004, Size=768x768, Sampler=Euler a, Steps=20, CFG=6.4

### decorations/fruits/mango_slice/default.png
Prompt: mango slice sticker asset, curved mango piece in warm golden yellow and peach tones, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic fruit, glossy, detailed realism, vector clean lines, black background, watermark, blur
Settings: Seed=88880005, Size=1024x512, Sampler=Euler a, Steps=22, CFG=6.6

### decorations/fruits/kiwi_slice/default.png
Prompt: kiwi slice sticker asset, simple round kiwi slice with mint-green flesh and tiny seed ring, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic fruit, glossy, detailed realism, vector clean lines, black background, watermark, blur
Settings: Seed=88880006, Size=1024x512, Sampler=Euler a, Steps=22, CFG=6.6

### decorations/fruits/raspberry/default.png
Prompt: raspberry sticker asset, simple berry cluster in raspberry-pink tones with butter-yellow highlight, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic fruit, glossy, detailed realism, vector clean lines, black background, watermark, blur
Settings: Seed=88880007, Size=768x768, Sampler=Euler a, Steps=20, CFG=6.4

### decorations/fruits/white_peach_slice/default.png
Prompt: white peach slice sticker asset, soft peach and cream slice with blush-pink edge, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic fruit, glossy, detailed realism, vector clean lines, black background, watermark, blur
Settings: Seed=88880008, Size=1024x512, Sampler=Euler a, Steps=22, CFG=6.6

### decorations/sweets/sugar_beads_gold/default.png
Prompt: sugar bead sticker asset, tiny round bead in soft warm gold with a butter-yellow highlight, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic candy, metallic shine, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=99990001, Size=256x256, Sampler=Euler a, Steps=18, CFG=6.0

### decorations/sweets/sugar_beads_silver/default.png
Prompt: sugar bead sticker asset, tiny round bead in soft silver-gray with a butter-yellow highlight, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic candy, metallic shine, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=99990002, Size=256x256, Sampler=Euler a, Steps=18, CFG=6.0

### decorations/sweets/chocolate_stick/default.png
Prompt: chocolate stick sticker asset, simple slim chocolate bar in cocoa brown with dusty pink accent, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic chocolate, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=99990003, Size=512x256, Sampler=Euler a, Steps=20, CFG=6.3

### decorations/sweets/heart_chocolate/default.png
Prompt: heart chocolate sticker asset, rounded heart candy in cocoa brown with butter-yellow highlight, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic chocolate, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=99990004, Size=512x512, Sampler=Euler a, Steps=20, CFG=6.3

### decorations/toppers/flowers/daisy/default.png
Prompt: daisy topper sticker asset, simple daisy flower with cream petals and butter-yellow center on a slim stick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic flower, glossy, detailed realism, vector clean lines, black background, watermark, blur
Settings: Seed=10101001, Size=768x768, Sampler=Euler a, Steps=20, CFG=6.4

### decorations/toppers/flowers/jasmine_petals/default.png
Prompt: jasmine petals topper sticker asset, small soft petal cluster in cream and pale blush on a slim stick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic flower, glossy, detailed realism, vector clean lines, black background, watermark, blur
Settings: Seed=10101002, Size=768x768, Sampler=Euler a, Steps=20, CFG=6.4

### decorations/toppers/flowers/lily_of_the_valley/default.png
Prompt: lily-of-the-valley topper sticker asset, simple hanging bell flowers in cream and mint on a slim stick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic flower, glossy, detailed realism, vector clean lines, black background, watermark, blur
Settings: Seed=10101003, Size=768x768, Sampler=Euler a, Steps=20, CFG=6.4

### decorations/toppers/shapes/heart/default.png
Prompt: heart topper sticker asset, rounded heart shape in raspberry pink with butter-yellow highlight on a slim stick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic topper, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=10101004, Size=768x768, Sampler=Euler a, Steps=18, CFG=6.2

### decorations/toppers/shapes/star/default.png
Prompt: star topper sticker asset, rounded five-point star in butter-yellow with sky-blue outline on a slim stick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic topper, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=10101005, Size=768x768, Sampler=Euler a, Steps=18, CFG=6.2

### decorations/toppers/shapes/moon/default.png
Prompt: moon topper sticker asset, crescent moon in butter-yellow with sky-blue accent on a slim stick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic topper, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=10101006, Size=768x768, Sampler=Euler a, Steps=18, CFG=6.2

### decorations/toppers/ribbons/bow/default.png
Prompt: bow topper sticker asset, rounded ribbon bow in raspberry pink with cream highlights on a slim stick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic ribbon, glossy satin, vector clean lines, black background, watermark, blur
Settings: Seed=10101007, Size=768x768, Sampler=Euler a, Steps=18, CFG=6.2

### decorations/toppers/plaques/happy_birthday/default.png
Prompt: cake topper plaque sticker asset, small rounded plaque with loose hand-drawn crayon lettering that reads Happy Birthday, cream plaque with sky-blue outline and raspberry-pink accent, attached to a slim stick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, transparent background
Negative: photorealistic plaque, glossy acrylic, vector clean lines, black background, watermark, dense typography, blur
Settings: Seed=10101008, Size=1024x512, Sampler=Euler a, Steps=24, CFG=7.0

### decorations/toppers/plaques/chun_jin_xia_sheng/default.png
Prompt: cake topper plaque sticker asset, small rounded plaque with loose hand-drawn crayon lettering that reads 春尽夏生, cream plaque with sky-blue outline and raspberry-pink accent, attached to a slim stick, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, transparent background
Negative: photorealistic plaque, glossy acrylic, vector clean lines, black background, watermark, dense typography, blur
Settings: Seed=10101009, Size=1024x512, Sampler=Euler a, Steps=24, CFG=7.0

## 仪式与切蛋糕素材

### ceremony/candle_flames/lit/flame_01.png
Prompt: candle flame animation frame 1 only, small rounded flame with butter-yellow core and warm orange edge, soft sky-blue outline hint, naive childlike crayon drawing, visible wax grain, transparent background
Negative: photorealistic fire, realistic smoke, glossy glow, black background, watermark, blur
Settings: Seed=12121201, Size=512x512, Sampler=Euler a, Steps=18, CFG=6.0

### ceremony/candle_flames/lit/flame_02.png
Prompt: candle flame animation frame 2 only, slightly taller rounded flame with butter-yellow core and warm orange edge, soft sky-blue outline hint, naive childlike crayon drawing, visible wax grain, transparent background
Negative: photorealistic fire, realistic smoke, glossy glow, black background, watermark, blur
Settings: Seed=12121202, Size=512x512, Sampler=Euler a, Steps=18, CFG=6.0

### ceremony/candle_flames/lit/flame_03.png
Prompt: candle flame animation frame 3 only, slightly wider rounded flame with butter-yellow core and warm orange edge, soft sky-blue outline hint, naive childlike crayon drawing, visible wax grain, transparent background
Negative: photorealistic fire, realistic smoke, glossy glow, black background, watermark, blur
Settings: Seed=12121203, Size=512x512, Sampler=Euler a, Steps=18, CFG=6.0

### ceremony/candle_flames/lit/flame_04.png
Prompt: candle flame animation frame 4 only, slightly tilted rounded flame with butter-yellow core and warm orange edge, soft sky-blue outline hint, naive childlike crayon drawing, visible wax grain, transparent background
Negative: photorealistic fire, realistic smoke, glossy glow, black background, watermark, blur
Settings: Seed=12121204, Size=512x512, Sampler=Euler a, Steps=18, CFG=6.0

### ceremony/candle_flames/extinguishing/extinguish_01.png
Prompt: extinguishing flame puff frame 1 only, soft gray smoke puff with a tiny fading butter-yellow center, naive childlike crayon drawing, visible wax grain, transparent background
Negative: photorealistic smoke, realistic particles, glossy glow, black background, watermark, blur
Settings: Seed=12121211, Size=512x512, Sampler=Euler a, Steps=18, CFG=6.0

### ceremony/candle_flames/extinguishing/extinguish_02.png
Prompt: extinguishing flame puff frame 2 only, slightly wider soft gray smoke puff with a tiny fading butter-yellow center, naive childlike crayon drawing, visible wax grain, transparent background
Negative: photorealistic smoke, realistic particles, glossy glow, black background, watermark, blur
Settings: Seed=12121212, Size=512x512, Sampler=Euler a, Steps=18, CFG=6.0

### ceremony/candle_flames/extinguishing/extinguish_03.png
Prompt: extinguishing flame puff frame 3 only, soft gray smoke puff almost fully faded, dusty lavender edge tint, naive childlike crayon drawing, visible wax grain, transparent background
Negative: photorealistic smoke, realistic particles, glossy glow, black background, watermark, blur
Settings: Seed=12121213, Size=512x512, Sampler=Euler a, Steps=18, CFG=6.0

### ceremony/tools/cake_knife/knife.png
Prompt: cake knife sticker asset, rounded friendly cake knife with cream handle, sky-blue trim and butter-yellow highlight, safe soft shape, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic knife, sharp metallic blade, realistic reflections, vector clean lines, black background, watermark, blur
Settings: Seed=13131313, Size=1024x512, Sampler=Euler a, Steps=22, CFG=6.8

## 截图分享模板

### share/templates/polaroid/frame.png
Prompt: polaroid photo frame asset, thick cream paper frame with sky-blue outline accents and a raspberry-pink handwritten doodle stripe, large empty photo window in the center, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, off-white paper texture
Negative: photorealistic frame, glossy acrylic, 3d bevel, dark frame, watermark, blur
Settings: Seed=12345001, Size=2400x3000, Sampler=DPM++ 2M Karras, Steps=30, CFG=7.0

### share/templates/cream_daisy/frame.png
Prompt: cream daisy photo frame asset, cream paper frame with small daisy doodles, butter-yellow centers, sky-blue outline accents and raspberry-pink corner marks, large empty photo window in the center, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, off-white paper texture
Negative: photorealistic frame, glossy acrylic, 3d bevel, dark frame, watermark, blur
Settings: Seed=12345002, Size=2400x3000, Sampler=DPM++ 2M Karras, Steps=30, CFG=7.0

### share/templates/spring_summer/frame.png
Prompt: spring summer themed photo frame asset, cream paper frame with butter-yellow sun doodles, raspberry-pink floral marks and sky-blue hat-like curved accents, large empty photo window in the center, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, off-white paper texture
Negative: photorealistic frame, glossy acrylic, 3d bevel, dark frame, watermark, blur
Settings: Seed=12345003, Size=2400x3000, Sampler=DPM++ 2M Karras, Steps=30, CFG=7.0

## 界面图标

### ui/icons/undo.png
Prompt: undo icon sticker asset, simple curved arrow in sky-blue with butter-yellow highlight, naive childlike crayon drawing, visible wax grain, thick slightly wobbly outline, transparent background
Negative: photorealistic icon, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=14141401, Size=256x256, Sampler=Euler a, Steps=18, CFG=6.0

### ui/icons/clear.png
Prompt: clear icon sticker asset, simple broom and sparkle symbol in raspberry-pink and sky-blue, naive childlike crayon drawing, visible wax grain, thick slightly wobbly outline, transparent background
Negative: photorealistic icon, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=14141402, Size=256x256, Sampler=Euler a, Steps=18, CFG=6.0

### ui/icons/next.png
Prompt: next icon sticker asset, simple arrow in butter-yellow with sky-blue outline, naive childlike crayon drawing, visible wax grain, thick slightly wobbly outline, transparent background
Negative: photorealistic icon, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=14141403, Size=256x256, Sampler=Euler a, Steps=18, CFG=6.0

### ui/icons/save.png
Prompt: save icon sticker asset, simple save badge or download symbol in sky-blue with raspberry-pink accent, naive childlike crayon drawing, visible wax grain, thick slightly wobbly outline, transparent background
Negative: photorealistic icon, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=14141404, Size=256x256, Sampler=Euler a, Steps=18, CFG=6.0

### ui/icons/close.png
Prompt: close icon sticker asset, simple rounded X in raspberry-pink with butter-yellow highlight, naive childlike crayon drawing, visible wax grain, thick slightly wobbly outline, transparent background
Negative: photorealistic icon, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=14141405, Size=256x256, Sampler=Euler a, Steps=18, CFG=6.0

### ui/icons/delete.png
Prompt: delete icon sticker asset, simple trash can symbol in sky-blue with butter-yellow highlight, naive childlike crayon drawing, visible wax grain, thick slightly wobbly outline, transparent background
Negative: photorealistic icon, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=14141406, Size=256x256, Sampler=Euler a, Steps=18, CFG=6.0

### ui/icons/sound_on.png
Prompt: sound on icon sticker asset, simple speaker with two sound waves in sky-blue and butter-yellow, naive childlike crayon drawing, visible wax grain, thick slightly wobbly outline, transparent background
Negative: photorealistic icon, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=14141407, Size=256x256, Sampler=Euler a, Steps=18, CFG=6.0

### ui/icons/sound_off.png
Prompt: sound off icon sticker asset, simple speaker with a small rounded X in sky-blue and raspberry-pink, naive childlike crayon drawing, visible wax grain, thick slightly wobbly outline, transparent background
Negative: photorealistic icon, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=14141408, Size=256x256, Sampler=Euler a, Steps=18, CFG=6.0

### ui/cursors/drag.png
Prompt: drag cursor sticker asset, simple hand or four-way drag symbol in butter-yellow and sky-blue, naive childlike crayon drawing, visible wax grain, thick slightly wobbly outline, transparent background
Negative: photorealistic cursor, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=15151501, Size=128x128, Sampler=Euler a, Steps=16, CFG=6.0

### ui/cursors/rotate.png
Prompt: rotate cursor sticker asset, simple circular arrow symbol in sky-blue with raspberry-pink accent, naive childlike crayon drawing, visible wax grain, thick slightly wobbly outline, transparent background
Negative: photorealistic cursor, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=15151502, Size=128x128, Sampler=Euler a, Steps=16, CFG=6.0

### ui/cursors/scale.png
Prompt: scale cursor sticker asset, simple diagonal arrows symbol in butter-yellow and sky-blue, naive childlike crayon drawing, visible wax grain, thick slightly wobbly outline, transparent background
Negative: photorealistic cursor, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=15151503, Size=128x128, Sampler=Euler a, Steps=16, CFG=6.0

## 全局蜡笔风素材

### style/paper_textures/background_paper.png
Prompt: seamless off-white drawing paper texture, soft toothy grain, faint warm butter-yellow and blush-pink wax dust, childlike handmade paper feel, subtle uneven coverage
Negative: photorealistic paper sheet edges, heavy stains, dark shadows, watermark, blur
Settings: Seed=16161601, Size=2048x2048, Sampler=DPM++ 2M Karras, Steps=24, CFG=6.5

### style/paper_textures/card_paper.png
Prompt: seamless cream card paper texture, slightly denser toothy grain, soft sky-blue and blush-pink rubbed crayon residue, childlike handmade card feel
Negative: photorealistic paper sheet edges, heavy stains, dark shadows, watermark, blur
Settings: Seed=16161602, Size=2048x2048, Sampler=DPM++ 2M Karras, Steps=24, CFG=6.5

### style/crayon_strokes/stroke_cream.png
Prompt: seamless cream crayon stroke texture, broad waxy strokes in cream and butter-yellow, visible pigment flecks, uneven childlike hand-rubbed coverage, transparent-friendly texture feel
Negative: photorealistic paint, glossy, hard brush edges, dark stains, watermark, blur
Settings: Seed=17171701, Size=2048x2048, Sampler=DPM++ 2M Karras, Steps=28, CFG=6.8

### style/crayon_strokes/stroke_brown.png
Prompt: seamless brown crayon stroke texture, broad waxy strokes in soft cocoa brown and dusty taupe, visible pigment flecks, uneven childlike hand-rubbed coverage, transparent-friendly texture feel
Negative: photorealistic paint, glossy, hard brush edges, dark stains, watermark, blur
Settings: Seed=17171702, Size=2048x2048, Sampler=DPM++ 2M Karras, Steps=28, CFG=6.8

### style/crayon_strokes/stroke_pink.png
Prompt: seamless pink crayon stroke texture, broad waxy strokes in raspberry pink and blush pink, visible pigment flecks, uneven childlike hand-rubbed coverage, transparent-friendly texture feel
Negative: photorealistic paint, glossy, hard brush edges, dark stains, watermark, blur
Settings: Seed=17171703, Size=2048x2048, Sampler=DPM++ 2M Karras, Steps=28, CFG=6.8

### style/doodles/star.png
Prompt: tiny doodle star sticker asset, rounded star in butter-yellow with sky-blue outline accent, naive childlike crayon drawing, visible wax grain, thick slightly wobbly outline, transparent background
Negative: photorealistic doodle, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=18181801, Size=256x256, Sampler=Euler a, Steps=16, CFG=6.0

### style/doodles/heart.png
Prompt: tiny doodle heart sticker asset, rounded heart in raspberry pink with butter-yellow highlight, naive childlike crayon drawing, visible wax grain, thick slightly wobbly outline, transparent background
Negative: photorealistic doodle, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=18181802, Size=256x256, Sampler=Euler a, Steps=16, CFG=6.0

### style/doodles/flower.png
Prompt: tiny doodle flower sticker asset, simple flower in cream, butter-yellow and sky-blue, naive childlike crayon drawing, visible wax grain, thick slightly wobbly outline, transparent background
Negative: photorealistic doodle, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=18181803, Size=256x256, Sampler=Euler a, Steps=16, CFG=6.0

### style/doodles/sparkle.png
Prompt: tiny doodle sparkle sticker asset, simple sparkle shape in butter-yellow with raspberry-pink accent, naive childlike crayon drawing, visible wax grain, thick slightly wobbly outline, transparent background
Negative: photorealistic doodle, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=18181804, Size=256x256, Sampler=Euler a, Steps=16, CFG=6.0

### style/frames/hand_drawn_border.png
Prompt: irregular hand-drawn border frame asset, cream border with sky-blue and raspberry-pink crayon accents, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, off-white paper texture, large empty center
Negative: photorealistic frame, glossy acrylic, 3d bevel, dark frame, watermark, blur
Settings: Seed=19191901, Size=2048x2048, Sampler=DPM++ 2M Karras, Steps=28, CFG=6.9

### style/stickers/tape.png
Prompt: washi tape sticker asset, short strip of cream tape with sky-blue edge and raspberry-pink doodle stripe, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, thick slightly wobbly outline, transparent background
Negative: photorealistic tape, glossy plastic, vector clean lines, black background, watermark, blur
Settings: Seed=19191902, Size=1024x256, Sampler=Euler a, Steps=20, CFG=6.3

### style/stickers/note.png
Prompt: memo note sticker asset, small rounded note paper in cream with sky-blue outline and raspberry-pink doodle corner, naive childlike crayon drawing, visible wax grain, uneven hand-colored fill, off-white paper texture, transparent background
Negative: photorealistic sticky note, glossy, vector clean lines, black background, watermark, blur
Settings: Seed=19191903, Size=512x512, Sampler=Euler a, Steps=20, CFG=6.3