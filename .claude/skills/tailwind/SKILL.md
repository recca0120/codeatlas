---
name: tailwind
description: Tailwind CSS v4 最佳實踐指南。當需要設定 Tailwind、整合 Astro、設計元件樣式、實作 Dark Mode、或建立設計系統時使用。
---

# Tailwind CSS v4 Best Practices (v4.2.2)

## v4 重要差異（從 v3 遷移）

```css
/* v3 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v4 — CSS-first，不需要 tailwind.config.js */
@import "tailwindcss";
```

### Breaking Changes

| v3 | v4 |
|----|-----|
| `bg-opacity-50` | `bg-black/50` |
| `flex-shrink-*` | `shrink-*` |
| `shadow-sm` | `shadow-xs` |
| `outline-none` | `outline-hidden` |
| `!flex` | `flex!`（移至結尾）|
| `bg-[--var]` | `bg-(--var)` |
| `tailwind.config.js` | CSS `@theme` block |

瀏覽器需求：Safari 16.4+、Chrome 111+、Firefox 128+

## Astro 整合

```bash
npm install tailwindcss @tailwindcss/vite
```

```ts
// astro.config.mjs
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  vite: { plugins: [tailwindcss()] },
});
```

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  --color-brand: oklch(0.65 0.25 250);
  --font-heading: "Space Grotesk", system-ui, sans-serif;
}
```

```astro
---
// layouts/Layout.astro
import "../styles/global.css";
---
```

**Astro `<style>` 中使用 `@apply`**：
```astro
<style>
  @reference "../../styles/global.css";
  .btn { @apply rounded-lg bg-brand px-4 py-2 text-white; }
</style>
```

## @theme — CSS-first 設計系統

```css
@theme {
  /* Colors */
  --color-base: #0a0a0f;
  --color-surface: #161b22;
  --color-accent: #7c3aed;
  --color-gold: #ffd700;

  /* Fonts */
  --font-heading: "Space Grotesk", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* Spacing */
  --spacing-18: 4.5rem;

  /* Animations */
  --animate-fade-in: fade-in 0.4s ease;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

使用：`bg-base`、`text-accent`、`font-heading`、`animate-fade-in`

## Glassmorphism

```html
<div class="bg-white/5 backdrop-blur-xl border border-white/8 rounded-2xl shadow-2xl">
  <!-- glass card -->
</div>
```

## Dark Mode

v4 預設使用 `prefers-color-scheme`：

```css
@custom-variant dark (&:where(.dark, .dark *));
```

```html
<div class="bg-white dark:bg-gray-900">...</div>
```

## 常用 v4 Pattern

### Gradient Text
```html
<span class="bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
  GitStar
</span>
```

### Hover Lift Card
```html
<div class="transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-white/15">
```

### Stagger Animation（搭配 JS IntersectionObserver）
```html
<div class="opacity-0 translate-y-5 transition-all duration-400" style="transition-delay: 50ms">
```

### Responsive Grid
```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Container Query
```html
<div class="@container">
  <div class="@sm:flex @sm:gap-4">
```

## 常見陷阱

1. **v4 不需要 `tailwind.config.js`** — 用 `@theme` 取代
2. **`@apply` 在 Astro `<style>` 需要 `@reference`**
3. **v4 不支援 `purge` 選項** — 自動 tree-shake
4. **Opacity 語法改變** — `bg-opacity-50` → `bg-black/50`
5. **Important 語法改變** — `!flex` → `flex!`
6. **CSS 變數語法** — `bg-[--var]` → `bg-(--var)`
