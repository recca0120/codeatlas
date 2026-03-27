## Why

目前 SSG 為每個國家和使用者預生成 HTML（134 國 × 1000 人 = 134K 頁面），build 時間太長且不合理。改為 client-side routing — build 只生成首頁和 FAQ，國家頁和個人頁在瀏覽器端從 JSON 動態渲染。

## What Changes

- 移除 `[country]/index.astro` 和 `[country]/[user].astro` 的 getStaticPaths
- 新增 catch-all page `[...slug].astro`，client-side 判斷路由
- 國家頁和個人頁改為 Svelte 元件，fetch `/data/{country}.json` 渲染
- Build 只產生 2 個 HTML（`/` + `/faq`）+ 靜態 JSON 資料
- GitHub Pages 需要 404.html fallback 指向 catch-all

## Impact

- 刪除 `src/pages/[country]/index.astro` 和 `src/pages/[country]/[user].astro`
- 新增 `src/pages/[...slug].astro`（catch-all）
- 新增 `src/components/CountryPage.svelte` 和 `src/components/ProfilePage.svelte`
- `public/404.html` 指向 catch-all（GitHub Pages SPA fallback）
