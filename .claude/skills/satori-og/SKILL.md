---
name: satori-og
description: Satori + @resvg/resvg-js OG image 產生最佳實踐指南。當需要產生 Open Graph 預覽圖、設定 OG/Twitter Card meta tags、或整合 Astro build-time image 產生時使用。
---

# Satori + resvg OG Image Generation Guide

## 版本資訊

| 套件 | 版本 |
|------|------|
| satori | 0.26.0 |
| @resvg/resvg-js | 2.6.2 |

```bash
npm install satori @resvg/resvg-js
```

**satori 0.26.0 新增**：內建 JSX runtime，不再需要 React。

## 基本用法

### 方式一：Plain objects（無需 transpiler）

```typescript
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';

// 全域載入字型，不要在每次請求時重新載入
const inter = fs.readFileSync('./public/fonts/Inter-Regular.ttf');
const interBold = fs.readFileSync('./public/fonts/Inter-Bold.ttf');

const FONTS = [
  { name: 'Inter', data: inter, weight: 400 as const, style: 'normal' as const },
  { name: 'Inter', data: interBold, weight: 700 as const, style: 'normal' as const },
];

const svg = await satori(
  {
    type: 'div',
    props: {
      style: { display: 'flex', color: 'white', fontSize: 48 },
      children: 'Hello World',
    },
  },
  { width: 1200, height: 630, fonts: FONTS }
);

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  font: { loadSystemFonts: false }, // satori 已嵌入字型，關掉加速
});
const png = resvg.render().asPng(); // Uint8Array
```

### 方式二：內建 JSX runtime（0.26.0+）

```tsx
/** @jsxRuntime automatic */
/** @jsxImportSource satori/jsx */

const svg = await satori(
  <div style={{ display: 'flex', color: 'white' }}>Hello</div>,
  { width: 1200, height: 630, fonts: FONTS }
);
```

## 支援的 CSS 子集

**Layout**：`display`（flex/none）、`position`（relative/absolute）、所有 flexbox 屬性（flexDirection、gap 等）

**Sizing**：width/height/min/max（不支援 `min-content`/`max-content`/`fit-content`）

**Typography**：fontFamily、fontSize、fontWeight、fontStyle、textAlign、lineHeight、letterSpacing、textOverflow（clip/ellipsis）、textShadow、lineClamp

**Visual**：backgroundColor、backgroundImage（gradient/url）、borderWidth/Style/Color/Radius、boxShadow、opacity、filter、transform（2D only）

**重要限制**：
- **預設 display 是 `flex`**，不是 `block` — 每個 div 都是 flex container
- 不支援 `calc()`
- 不支援 `z-index`（SVG 按文件順序繪製）
- 不支援 3D transforms
- 不支援 WOFF2 字型 — 只支援 TTF、OTF、WOFF

## 字型載入

```typescript
// 全域載入，重複使用
const FONTS = [
  { name: 'Inter', data: fs.readFileSync('./fonts/Inter-Regular.ttf'), weight: 400, style: 'normal' },
  { name: 'Inter', data: fs.readFileSync('./fonts/Inter-Bold.ttf'), weight: 700, style: 'normal' },
];

// CJK 字型按需載入
await satori(element, {
  fonts: FONTS,
  loadAdditionalAsset: async (code, segment) => {
    if (code === 'emoji') return `data:image/svg+xml;base64,...`;
    return loadCJKFont(code);
  },
});
```

**規則**：
- 只支援 TTF、OTF、WOFF（不支援 WOFF2）
- 字型資料必須是 `ArrayBuffer` 或 `Buffer`
- CJK 文字加 `lang` 屬性：`<div lang="zh-TW">`

## 圖片處理

```typescript
// 遠端圖片可以直接用，但有延遲
{ type: 'img', props: { src: 'https://...', width: 200, height: 200 } }

// 最佳實踐：預先抓取轉 base64
const avatarBase64 = Buffer.from(
  await fetch(url).then(r => r.arrayBuffer())
).toString('base64');
{ type: 'img', props: { src: `data:image/jpeg;base64,${avatarBase64}`, width: 200, height: 200 } }
```

**務必指定 width/height**，否則版面不可預測。

## OG Image 尺寸標準

| 平台 | 建議尺寸 | 比例 |
|------|----------|------|
| Open Graph（Facebook、Threads、LinkedIn） | **1200 x 630** | ~1.91:1 |
| Twitter summary_large_image | 1200 x 628 | ~1.91:1 |

**統一用 1200 x 630**。

## Astro 整合（Build-time 產生）

```typescript
// src/pages/og/[slug].png.ts
import type { APIRoute, GetStaticPaths } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';

const FONTS = [
  { name: 'Inter', data: fs.readFileSync('./public/fonts/Inter-Regular.ttf'), weight: 400 as const, style: 'normal' as const },
];

export const getStaticPaths: GetStaticPaths = async () => {
  // 回傳所有需要產生 OG image 的路徑
  return users.map(user => ({ params: { slug: user.username }, props: { user } }));
};

export const GET: APIRoute = async ({ props }) => {
  const svg = await satori(
    { type: 'div', props: { style: { /* ... */ }, children: props.user.name } },
    { width: 1200, height: 630, fonts: FONTS }
  );

  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    font: { loadSystemFonts: false },
  }).render().asPng();

  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
```

`astro build` 時自動為每個 static path 產生 PNG 檔案。

## Meta Tags 設定

```html
<!-- Open Graph（必要） -->
<meta property="og:title" content="台灣 GitHub 開發者排行榜" />
<meta property="og:type" content="website" />
<meta property="og:image" content="https://example.com/og/default.png" />
<meta property="og:url" content="https://example.com/" />

<!-- Open Graph（建議） -->
<meta property="og:description" content="台灣 GitHub 開發者 3D 視覺化排行" />
<meta property="og:site_name" content="GitStar" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" />
<meta property="og:locale" content="zh_TW" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="台灣 GitHub 開發者排行榜" />
<meta name="twitter:description" content="台灣 GitHub 開發者 3D 視覺化排行" />
<meta name="twitter:image" content="https://example.com/og/default.png" />
```

**要點**：
- Image URL 必須是絕對路徑
- 指定 `og:image:width` 和 `og:image:height` 避免爬蟲需要抓圖片判斷尺寸
- Twitter 用 `summary_large_image` 顯示大圖
- 用 PNG 格式（文字較清晰）

## 效能建議（大量產生時）

1. 字型全域載入一次，不要每次重新讀取
2. 遠端圖片預先 fetch 轉 base64
3. resvg 設定 `loadSystemFonts: false`
4. Build time 產生（SSG）而非 on-demand
5. 內容未變則跳過重新產生
6. JSX 結構保持簡單，深層巢狀會拖慢
7. 多張圖片用 `Promise.all` 並行（注意記憶體）

## 常見陷阱

1. 預設 display 是 `flex` 不是 `block`
2. 不支援 WOFF2 字型
3. 不支援 `calc()`、`z-index`、3D transforms
4. img 未指定 width/height 導致版面異常
5. 遠端圖片網路問題導致 build 失敗 → 預先 fetch + fallback
