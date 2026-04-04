[English](DEVELOPMENT.md)

# 開發指南

## 開始使用

```bash
pnpm install
pnpm dev          # 啟動開發伺服器 localhost:4321
pnpm build        # 建置正式版本
pnpm preview      # 預覽正式版本
```

## 資料收集

排名透過 GitHub Actions 每週收集。本地執行：

```bash
# 產生假資料供開發使用
pnpm tsx scripts/cli.ts generate

# 收集真實資料（需要 GITHUB_TOKEN）
GITHUB_TOKEN=ghp_xxx pnpm tsx scripts/cli.ts collect
```

## 設定

| 變數 | 說明 | 預設值 |
|---|---|---|
| `PUBLIC_DEFAULT_LOCALE` | 預設語言（`en` 或 `zh-TW`） | `en` |
| `PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 追蹤 ID | — |
| `GITHUB_TOKEN` | 用於資料收集的 GitHub API token | — |

## 技術架構

- **框架：** Astro 6（靜態網站生成）
- **UI：** Svelte 5（Islands 架構）
- **樣式：** Tailwind CSS v4
- **3D：** Globe.gl + Three.js
- **資料：** GitHub REST & GraphQL APIs（透過 Octokit）
- **驗證：** Zod（Runtime Schema 驗證）
- **CI/CD：** GitHub Actions + GitHub Pages

## 專案結構

```
src/
  i18n/          # 國際化（語系檔、t() 輔助函式）
  components/    # Svelte 5 元件（islands）
  layouts/       # Astro 版面配置
  lib/           # 共用工具、API 客戶端、Zod schemas
  pages/         # Astro 頁面（en + zh-TW）
  styles/        # 全域 CSS
config/          # 國家設定檔
public/data/     # 產生的排名資料（JSON）
scripts/         # 資料收集 CLI 工具
```

## 貢獻

請參閱 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何新增國家、修正資料或貢獻程式碼。
