## 1. 路由架構

- [ ] 1.1 新增 catch-all page `[...slug].astro` — 傳 slug 給 Svelte router
- [ ] 1.2 新增 `public/404.html` — redirect 到 catch-all（GitHub Pages SPA）
- [ ] 1.3 刪除 `src/pages/[country]/index.astro` 和 `[country]/[user].astro`

## 2. Client-side 頁面元件

- [ ] 2.1 CountryPage.svelte — fetch data/{country}.json + 渲染排名（含 RankingFilter）
- [ ] 2.2 ProfilePage.svelte — 從已載入的 country data 找使用者 + 渲染 profile
- [ ] 2.3 AppRouter.svelte — 解析 URL path，決定顯示 CountryPage 或 ProfilePage
- [ ] 2.4 國家列表 JSON — 在首頁 build 時產生 /data/countries-index.json

## 3. 首頁調整

- [ ] 3.1 首頁 build 時產生 countries-index.json（code, name, flag）
- [ ] 3.2 Globe 和 CountrySearch 改用 countries-index.json

## 4. 驗證

- [ ] 4.1 Tests + typecheck
- [ ] 4.2 Dev server 驗證所有路由
- [ ] 4.3 Commit + push
