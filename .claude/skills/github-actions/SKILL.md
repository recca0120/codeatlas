---
name: github-actions
description: GitHub Actions CI/CD 最佳實踐指南。當需要設定 workflow、cron 排程、GitHub Pages 部署、使用 Octokit API、或處理 rate limiting 時使用。
---

# GitHub Actions Best Practices Guide

## Runner 環境

| Runner | OS | Node.js |
|--------|-----|---------|
| `ubuntu-latest` | Ubuntu 24.04 | Node 20（2026-06 起預設 Node 24） |
| `ubuntu-24.04` | Ubuntu 24.04（固定版本） | 同上 |

**Node 20 EOL：2026-04**。建議新專案直接用 Node 22。

## Cron 排程

```yaml
on:
  schedule:
    - cron: '17 3 * * 1'   # 每週一 03:17 UTC（避開整點）
  workflow_dispatch:          # 搭配手動觸發做測試
```

**注意事項**：
- 所有排程為 **UTC** 時區
- **避免整點** `:00` — GitHub 尖峰負載，延遲較大。用 `:17`、`:43` 等偏移
- 排程 workflow 只在 **default branch** 執行
- Repo 60 天無活動 → GitHub 自動停用排程 workflow

## GitHub Pages 部署

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v4
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**必要**：`pages: write` + `id-token: write` 權限、`actions/upload-pages-artifact@v4`。

## Commit 回 Repo

```yaml
permissions:
  contents: write

steps:
  - uses: actions/checkout@v4
  - name: Generate data
    run: node scripts/collect-data.js
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  - name: Commit and push
    run: |
      git config user.name "github-actions[bot]"
      git config user.email "github-actions[bot]@users.noreply.github.com"
      git add data/
      git diff --staged --quiet || git commit -m "Update data [skip ci]"
      git push
```

**重要**：
- `[skip ci]` 防止無限觸發
- `git diff --staged --quiet || git commit` 避免空 commit 失敗
- GITHUB_TOKEN 的 commit **不會觸發**其他 workflow（防迴圈）
- 需要觸發其他 workflow → 用 PAT

## Octokit.js（GitHub REST API）

```typescript
import { Octokit } from '@octokit/rest';
import { throttling } from '@octokit/plugin-throttling';
import { retry } from '@octokit/plugin-retry';

const MyOctokit = Octokit.plugin(throttling, retry);
const octokit = new MyOctokit({
  auth: process.env.GITHUB_TOKEN,
  throttle: {
    onRateLimit: (retryAfter, options) => {
      console.warn(`Rate limit hit, retrying after ${retryAfter}s`);
      return true;
    },
    onSecondaryRateLimit: (retryAfter, options) => {
      console.warn(`Secondary rate limit hit`);
      return true;
    },
  },
});
```

### Search Users API

```typescript
const { data } = await octokit.rest.search.users({
  q: 'location:Taiwan followers:>10',
  sort: 'followers',
  order: 'desc',
  per_page: 100,
  page: 1,
});
// data.total_count, data.items[]
```

**Rate limits**：
- Search API：30 req/min（authenticated）、10 req/min（unauthenticated）
- Core API：5,000 req/hr（authenticated）
- 用 `@octokit/plugin-throttling` 自動處理

## Workflow 串接

### 方式一：workflow_run（同 repo）

```yaml
# 被觸發的 workflow
on:
  workflow_run:
    workflows: ["Data Collection"]
    types: [completed]
```

### 方式二：repository_dispatch（跨 repo，需 PAT）

```yaml
- name: Trigger deploy
  run: |
    curl -X POST \
      -H "Authorization: token ${{ secrets.PAT_TOKEN }}" \
      https://api.github.com/repos/owner/repo/dispatches \
      -d '{"event_type":"deploy"}'
```

**注意**：GITHUB_TOKEN **無法**觸發 `workflow_dispatch` 或 `repository_dispatch`。

### 方式三：Reusable workflows

```yaml
jobs:
  deploy:
    uses: ./.github/workflows/reusable-deploy.yml
    secrets: inherit
```

## Caching

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: 'npm'   # 內建 cache 支援
- run: npm ci
```

快取 `~/.npm`（不要快取 `node_modules`，因為 `npm ci` 會先刪除它）。

快取限制：10 GB/repo，7 天無存取自動過期。

## 安全最佳實踐

1. **Pin action 到完整 SHA**：
   ```yaml
   uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
   ```
2. **最小權限**：明確宣告 `permissions`
3. **不要在 shell 中內插不受信任的資料**：
   ```yaml
   # 錯誤：run: echo "${{ github.event.issue.title }}"
   # 正確：用 env
   env:
     TITLE: ${{ github.event.issue.title }}
   run: echo "$TITLE"
   ```
4. 避免 `pull_request_target`（fork PR 有 secrets 存取權）
5. 用 OIDC 取代靜態 secrets（雲端 credentials）

## 常見陷阱

1. 排程 workflow 在無活動 60 天後自動停用
2. GITHUB_TOKEN commit 不觸發其他 workflow
3. Cron 可能延遲 5-15+ 分鐘，不要依賴精確時間
4. YAML 格式錯誤佔 19% pipeline 錯誤 → 用 linter
5. 未加 `[skip ci]` 的自動 commit → 無限迴圈
6. 未 pin actions → 供應鏈攻擊風險
