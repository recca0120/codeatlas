## Why

目前首頁（`index.astro`）和排名/個人頁（`app.astro` → `AppRouter.svelte`）是兩個獨立的 Astro 頁面。點首頁的國家連結會觸發整頁跳轉，GitHub Pages 找不到路徑後走 404.html JS redirect 到 SPA。這造成：

1. 頁面閃爍（404 → redirect → SPA 載入）
2. 社群爬蟲看不到正確的 og tags
3. 首頁和 SPA 之間不能無縫切換

## What Changes

- 將首頁（地球、國家列表、搜尋）移入 Svelte SPA，成為 AppRouter 的一個路由
- 所有頁面（首頁、排名頁、個人頁、FAQ）統一由 AppRouter 管理
- 站內連結改用 client-side navigation（pushState），不刷頁
- 保留 404.html 作為直接訪問 URL 的 fallback（書籤、分享連結）
- 消除中英文頁面的程式碼重複（`index.astro` 和 `zh-TW/index.astro` 幾乎相同）

## Capabilities

### New Capabilities

- `client-routing`: 站內 client-side navigation，不刷頁切換頁面

### Modified Capabilities

（無 spec-level 行為變更）

## Impact

- `src/components/AppRouter.svelte` — 新增首頁和 FAQ 路由
- `src/components/HomePage.svelte` — 新元件，從 index.astro 提取
- `src/components/FaqPage.svelte` — 新元件，從 faq.astro 提取
- `src/pages/index.astro` — 簡化為只載入 AppRouter
- `src/pages/zh-TW/index.astro` — 同上
- `src/pages/faq.astro`、`src/pages/zh-TW/faq.astro` — 可能移除或簡化
- `src/pages/app.astro`、`src/pages/zh-TW/app.astro` — 可能合併到 index
