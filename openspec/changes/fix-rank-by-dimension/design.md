## Context

RankingFilter 有 3 個 dimension tabs，但 CountryPage 只傳 `rankings.public_contributions` 陣列。rankMap 根據這個固定陣列的順序建立，導致切換 tab 時 rank 數字不變。

目前 `CountryData` 同時存 `users` 和 `rankings`（3 份排序副本），造成 JSON 約 75% 冗餘。參考網站 gayanvoice/top-github-users 也只存一份 users，排序在輸出時才做。

## Goals / Non-Goals

**Goals:**
- 切換 dimension tab 時，rank 數字反映該 dimension 的正確排名
- JSON 只存一份 `users`，移除冗餘的 `rankings`
- 前端根據 dimension 排序 + 建 rankMap

**Non-Goals:**
- 不改動資料收集邏輯（github-client、cli collect）
- 不重抓 GitHub API，只需重新 build JSON

## Decisions

### 1. 移除 CountryData.rankings，只保留 users

**做法**: `buildCountryData` 不再產生 `rankings`，JSON 只存 `users` 陣列。

**理由**: 3 份排序副本是同一份資料的重複，浪費約 75% 空間。排序在前端做即可（資料量小，幾百筆）。

### 2. 前端用 rankUsers() 排序 + buildRankMap()

**做法**: RankingFilter 接收 `users`，根據當前 `dimension` 呼叫 `rankUsers(users, dimension)` 排序，再用 `buildRankMap()` 建立 rankMap。

**理由**: 復用已有的 `ranking.ts` 函式，排序邏輯集中在一處。

### 3. RankingFilter 的 filtered 不再內部排序

**做法**: `filtered` 以 `rankedUsers`（已按 dimension 排好）為基礎過濾，移除 `.sort()`。

## Risks / Trade-offs

- [JSON 格式變更] → collect-data 跑完後需重新 build。不影響正在執行的 collect-data。
- [前端排序] → 資料量小（每國幾百筆），效能影響可忽略。
