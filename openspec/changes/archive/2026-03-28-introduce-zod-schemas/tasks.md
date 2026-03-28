## 1. 安裝依賴

- [x] 1.1 安裝 zod v4

## 2. github-client.ts — Schema 重構（TDD）

- [x] 2.1 確認現有 github-client 相關測試全部通過（baseline）
- [x] 2.2 將 TopRepo 和 GitHubUser interfaces 改為 Zod schemas + z.infer type
- [x] 2.3 確認所有測試仍通過（expect 不變）

## 3. data-output.ts — Schema 重構（TDD）

- [x] 3.1 將 CountryData interface 改為 Zod schema + z.infer type
- [x] 3.2 rebuildCountryData 改用 CountryDataSchema.parse(raw)，參數型別改為 unknown
- [x] 3.3 移除測試中的 `as unknown as Record<string, unknown>` casting
- [x] 3.4 確認所有測試仍通過（expect 不變）

## 4. 全量驗證

- [x] 4.1 執行所有測試確認通過
- [x] 4.2 typecheck 通過
