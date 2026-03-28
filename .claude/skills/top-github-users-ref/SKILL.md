---
name: top-github-users-ref
description: gayanvoice/top-github-users 架構參考指南。當需要了解 GitHub 使用者排行榜的資料抓取管線、國家設定、排行計算邏輯、已知問題、或社群需求時使用。
---

# top-github-users 架構參考 + 社群回饋

## 資料抓取管線（從原始碼分析）

### 搜尋策略
- **GraphQL Search API**（非 REST）— 使用 `search(type: USER)` 查詢
- **所有 locations 合併成一個 query** — `location:Taiwan location:Taipei sort:followers-desc`
- **Cursor-based 分頁** — 用 `hasNextPage` + `endCursor` 遍歷所有結果，不限固定頁數
- **每頁 10 筆**（`first: 10`），透過 cursor 持續取得直到沒有下一頁

### 單次 GraphQL 取得所有欄位
一次查詢即取得：`login`、`avatarUrl`、`name`、`location`、`company`、`twitterUsername`、`followers.totalCount`、`contributionsCollection.contributionCalendar.totalContributions`、`contributionsCollection.restrictedContributionsCount`

**重點**：不需要逐人打 REST API 取 profile，效率遠高於 REST Search + 逐人 REST profile + 逐人 GraphQL contributions 的三步驟做法。

### Rate Limit 策略
- **隨機延遲 1-5 秒** — 每頁請求之間加入 `randomIntFromInterval(1000, 5000)` 延遲
- **錯誤重試** — 失敗時等待 60 秒，最多容許 4 次錯誤（`MAXIMUM_ERROR_ITERATIONS`）後停止
- **Checkpoint 機制** — 每次 cron 只處理一個國家（checkpoint），避免一次跑完所有國家撞 rate limit

### 資料保護
- **最低 750 筆保護** — 如果新抓的結果比快取少，且低於 750 筆，視為 API 錯誤，不覆蓋快取
- **快取機制** — 每個國家有獨立 cache 檔案，只在確認資料品質後才覆蓋

### 排序與排名
- 搜尋時依 `followers-desc` 排序
- 產出三種排名：Public Contributions、Total Contributions、Followers

## 與我們的差異比較

| 面向 | gayanvoice | CodeAtlas（目前） |
|------|-----------|------------------|
| 搜尋 API | GraphQL `search(type: USER)` | REST `search/users` |
| 每人 API calls | 1（GraphQL 包含全部欄位） | 3（REST search + REST profile + GraphQL contributions） |
| 分頁 | Cursor-based，無上限 | Page-based，上限 10 頁 × 100 = 1000 |
| Rate limit | 隨機延遲 1-5s + 錯誤等待 60s | Octokit throttle plugin |
| 處理單位 | 一次 cron 跑一個國家（checkpoint） | 一次 cron 跑所有國家（逐國 commit） |
| 快取保護 | 有（750 筆最低門檻） | 無 |

## 已知問題（從 Issues 學到的）

### Location 歧義問題（最嚴重）
- **Georgia（美國州）vs Georgia（國家）** — #291
- **Granada（西班牙城市）vs Granada（尼加拉瓜）** — #287
- **解決方案**：搜尋時加排除條件，如 `location:Georgia NOT location:"Georgia, US"` 或事後用 country code 過濾

### Emoji Flag Location — #279
- 有些使用者的 location 設為 flag emoji 如 🇹🇼
- **解決方案**：regex 偵測 flag emoji 並 mapping 到國家

### Contribution 計算不準 — #281 #295
- GraphQL `totalContributions` 和使用者看到的數字可能不同
- 原因：private repo contributions 計算差異
- **接受此限制**，清楚說明我們的計算方法

### Username 變更 — #123
- 使用者改名後舊資料不更新
- **解決方案**：每次 cron 重新抓取，不依賴快取的 username

### 使用者遺漏 — #222 #198
- 不理解為何沒被列入
- **解決方案**：建立 FAQ 頁面說明：需要設定 location、需要有足夠 followers/contributions

## 社群最想要的功能

1. **更頻繁更新**（weekly 以上）— 他們的 pipeline 壞了導致資料非常舊
2. **Profile info + top repos** — 目前只有 table，沒有個人資訊
3. **Star-based ranking** — 依總 star 數排名
4. **GitHub Pages 呈現** — 不只是 markdown 檔案
5. **容易新增國家/城市** — 目前需要 PR 改 config.json

## 我們的優勢

| 面向 | top-github-users | CodeAtlas |
|------|-------------------|---------|
| 呈現 | Markdown 表格 | GitHub Pages 網站 |
| 個人資料 | 無 | 語言、repos、bio、social |
| 搜尋/過濾 | 無 | 語言/城市/搜尋 |
| 更新頻率 | 壞了（~195 天一輪） | 每週 cron |
| 新增國家 | 需 PR 改 config.json | 加一個 JSON 檔 |
| Theme | 無 | Dark/Light toggle |
| 分享 | 有社群按鈕 | 有社群按鈕 + OG image |
| 3D | 無 | Globe 地球 |
