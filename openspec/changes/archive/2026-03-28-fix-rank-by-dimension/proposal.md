## Why

RankingFilter 元件有 3 個 tab（public_contributions、total_contributions、followers），切換 tab 會重新排序列表，但 rank 數字始終依照 public_contributions 的排名顯示。原因是 CountryPage 只傳入 `rankings.public_contributions` 給 RankingFilter，且 rankMap 不隨 dimension 變化。

## What Changes

- CountryPage 傳入完整的 `rankings`（3 個 dimension）給 RankingFilter，而非只傳單一 dimension 的 users
- RankingFilter 根據當前選中的 dimension 從 rankings 中取出對應的已排序列表
- rankMap 根據當前 dimension 對應的排序列表建立，確保 rank 數字正確

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

（無 spec-level 的行為變更，僅修正實作 bug）

## Impact

- `src/components/CountryPage.svelte` — 改傳 rankings 物件
- `src/components/RankingFilter.svelte` — 接收 rankings，根據 dimension 切換 users 和 rankMap
- `src/components/RankingFilter.test.ts` — 更新測試以反映新的 props 介面
