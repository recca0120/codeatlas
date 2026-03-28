## Context

目前架構：`index.astro`（靜態首頁）+ `app.astro`（SPA 入口）+ `404.html`（redirect fallback）。首頁和 SPA 之間是整頁跳轉，經過 404 redirect。

目標：所有頁面在同一個 Svelte SPA 內，用 client-side routing 切換，不刷頁。

## Goals / Non-Goals

**Goals:**
- 站內導航不刷頁（pushState + component 切換）
- 首頁地球、國家列表移入 SPA
- 消除 index.astro / zh-TW/index.astro 的程式碼重複
- 保留 404.html 給直接訪問 URL 的 fallback

**Non-Goals:**
- 不引入第三方 router 套件（手動 routing 已足夠）
- 不改變視覺設計
- 不改變資料載入邏輯

## Decisions

### 1. 所有頁面由 AppRouter 管理

AppRouter 新增路由：
- `/` → HomePage（從 index.astro 提取）
- `/faq` → FaqPage（從 faq.astro 提取）
- `/:country` → CountryPage（已有）
- `/:country/:user` → ProfilePage（已有）

### 2. 建立 Link component 處理 client-side navigation

```svelte
<Link href="/taiwan/">Taiwan</Link>
```

攔截 click → `history.pushState` → 觸發 AppRouter 重新解析路徑。所有站內連結統一用 Link component。

### 3. index.astro 簡化為 SPA shell

`index.astro` 和 `zh-TW/index.astro` 都只做：
```astro
<Layout><AppRouter client:only="svelte" /></Layout>
```

等同於現在的 `app.astro`。`app.astro` 可以移除。

### 4. 首頁地球元件化

地球初始化目前是 index.astro 的 inline `<script>`。移入 `HomePage.svelte` 後用 `onMount` 初始化。

### 5. AppRouter 監聽 popstate 和自訂事件

- `popstate` — 瀏覽器上一頁/下一頁
- 自訂 `navigate` 事件 — Link component dispatch

## Risks / Trade-offs

- [首頁地球在 SPA 內] → 切換到其他頁面時需要 dispose Three.js 資源，回到首頁重新初始化。`onMount`/`onDestroy` 處理。
- [首次載入稍重] → 首頁也需要載入 SPA bundle。但 globe.gl 本來就是 dynamic import，影響不大。
- [SEO] → 首頁的靜態 HTML 會變成 SPA shell（無內容）。但 Google 能跑 JS，社群分享靠 404.html 的 og tags。
