## 1. 建立 client-side navigation 基礎

- [x] 1.1 建立 navigate 函式和 Link.svelte component（TDD：測試 pushState 呼叫、ctrl+click 不攔截）
- [x] 1.2 AppRouter 監聯 popstate 事件，重新解析路徑

## 2. 提取首頁為 Svelte component

- [x] 2.1 建立 HomePage.svelte，從 index.astro 提取地球、國家列表、搜尋功能
- [x] 2.2 地球初始化移入 onMount，清理移入 onDestroy
- [x] 2.3 首頁所有連結改用 Link component

## 3. 提取 FAQ 為 Svelte component

- [x] 3.1 建立 FaqPage.svelte，從 faq.astro 提取內容
- [x] 3.2 FAQ 連結改用 Link component

## 4. 整合 AppRouter

- [x] 4.1 AppRouter 新增首頁路由（`/` → HomePage）和 FAQ 路由（`/faq` → FaqPage）
- [x] 4.2 CountryPage、ProfilePage、RankingFilter 內的連結改用 Link component
- [x] 4.3 AppRouter 加全域 click handler 攔截所有內部 <a> 連結（含 Layout nav）

## 5. 簡化 Astro 頁面

- [x] 5.1 index.astro 和 zh-TW/index.astro 簡化為 SPA shell
- [x] 5.2 移除 app.astro 和 zh-TW/app.astro
- [x] 5.3 移除 faq.astro 和 zh-TW/faq.astro（由 AppRouter 處理）
- [x] 5.4 更新 404.html redirect 到 / 而非 /app/

## 6. 驗證

- [x] 6.1 執行所有測試確認通過（140 tests）
- [ ] 6.2 手動測試：首頁 → 國家頁 → 個人頁 → 上一頁 → 首頁，全程不刷頁
- [ ] 6.3 手動測試：直接訪問 URL、書籤、分享連結仍可運作
