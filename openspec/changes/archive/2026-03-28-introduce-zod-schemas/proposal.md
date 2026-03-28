## Why

目前使用手動定義的 TypeScript interfaces（`GitHubUser`, `TopRepo`, `CountryData`）和 `as` type casting 處理 JSON 資料。`rebuildCountryData` 需要 `as unknown as Record<string, unknown>` 的醜陋轉型。引入 Zod v4 schema 可以：
- 用 `z.infer` 從 schema 推導 type，消除 interface 和 runtime 之間的不一致
- 用 `.parse()` 取代 type casting，安全解析 unknown JSON
- `z.object()` 預設 strip unknown keys，天然支援 rebuild 清理舊欄位

## What Changes

- 安裝 zod v4
- 將 `TopRepo` 和 `GitHubUser` interfaces 改為 Zod schemas，用 `z.infer` 推導 type
- 將 `CountryData` interface 改為 Zod schema
- `rebuildCountryData` 改用 schema `.parse()` 取代 type casting
- 測試的 expect 不變或等價（TDD 重構）

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

（無 spec-level 行為變更，純重構）

## Impact

- `src/lib/github-client.ts` — `TopRepo`, `GitHubUser` 改為 Zod schemas
- `src/lib/data-output.ts` — `CountryData` 改為 Zod schema，`rebuildCountryData` 用 `.parse()`
- `src/lib/octokit-github-client.ts` — 可能需要調整 import
- `package.json` — 新增 zod 依賴
