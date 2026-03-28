## 1. 資料層 — 移除 rankings

- [ ] 1.1 更新 data-output.test.ts：測試 buildCountryData 不再產生 rankings，只有 users
- [ ] 1.2 修改 CountryData interface 和 buildCountryData，移除 rankings
- [ ] 1.3 確認 data-output 測試通過

## 2. RankingFilter — 根據 dimension 排序和建 rankMap

- [ ] 2.1 更新 RankingFilter.test.ts：測試切換 dimension tab 後 rank 數字正確
- [ ] 2.2 RankingFilter 用 rankUsers(users, dimension) 排序，buildRankMap 依排序結果建立
- [ ] 2.3 移除 filtered 內的 .sort()，改以 rankedUsers 為基礎過濾
- [ ] 2.4 確認 RankingFilter 測試通過

## 3. CountryPage 適配

- [ ] 3.1 更新 CountryPage：從 countryData.users 取資料（移除 rankings 引用）
- [ ] 3.2 執行所有測試確認通過
