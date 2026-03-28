## Context

手動 interface + type casting 造成 `as unknown as Record<string, unknown>` 等問題。Zod v4 的 `z.object()` 預設 strip unknown keys，正好解決 `rebuildCountryData` 的需求。

## Goals / Non-Goals

**Goals:**
- 用 Zod schemas 取代手動 interfaces（`TopRepo`, `GitHubUser`, `CountryData`）
- `rebuildCountryData` 用 `CountryDataSchema.parse(raw)` 取代 type casting
- 所有現有測試 expect 不變或等價

**Non-Goals:**
- 不改變任何外部行為或 JSON 格式
- 不在 API 邊界加 runtime validation（僅重構型別定義）

## Decisions

### 1. Schema 定義在原本的檔案中

`TopRepoSchema` 和 `GitHubUserSchema` 定義在 `github-client.ts`，`CountryDataSchema` 定義在 `data-output.ts`。保持現有檔案結構，不新增檔案。

### 2. 用 z.infer 推導 type，export type alias

```ts
export const GitHubUserSchema = z.object({ ... });
export type GitHubUser = z.infer<typeof GitHubUserSchema>;
```

消費端的 `import type { GitHubUser }` 完全不受影響。

### 3. rebuildCountryData 直接用 .parse()

`z.object()` 預設 strip unknown keys（如舊的 `rankings`），所以 `CountryDataSchema.parse(raw)` 自動清理多餘欄位，參數型別改為 `unknown`。

## Risks / Trade-offs

- [新增依賴] → zod v4 bundle 僅 5.36kb gzipped，影響可忽略
- [Schema 定義稍冗長] → 但獲得 runtime validation + type inference 的好處
