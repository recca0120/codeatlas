[English](README.md)

# CodeAtlas

全球開發者排行榜 — 追蹤 130+ 個國家的開發者，依 GitHub 貢獻排名。每週更新。

**線上網站：** https://recca0120.github.io/codeatlas/

## 功能

- 國家級開發者排名（公開貢獻、總貢獻、追蹤者）
- 互動式 3D 地球儀視覺化
- 個人開發者頁面（程式語言分佈、熱門儲存庫）
- 國際化（英文 / 繁體中文）
- 深色模式
- 透過 GitHub Actions 每週自動收集資料

## 技術架構

- **框架：** Astro 6（靜態網站生成）
- **UI：** Svelte 5（Islands 架構）
- **樣式：** Tailwind CSS v4
- **3D：** Globe.gl + Three.js
- **資料：** GitHub REST & GraphQL APIs（透過 Octokit）
- **CI/CD：** GitHub Actions + GitHub Pages

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
| `GITHUB_TOKEN` | 用於資料收集的 GitHub API token | — |

## 專案結構

```
src/
  i18n/          # 國際化（語系檔、t() 輔助函式）
  components/    # Svelte 5 元件（islands）
  layouts/       # Astro 版面配置
  lib/           # 共用工具、API 客戶端
  pages/         # Astro 頁面（en + zh-TW）
  styles/        # 全域 CSS
config/          # 國家設定檔
public/data/     # 產生的排名資料（JSON）
scripts/         # 資料收集 CLI 工具
```

## 貢獻

請參閱 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何新增國家、修正資料或貢獻程式碼。

## 授權

MIT
