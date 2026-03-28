---
name: github-graphql
description: GitHub GraphQL API 最佳實踐指南。當需要使用 GraphQL 查詢使用者資料、處理 cursor pagination、計算 rate limit、或除錯 GraphQL errors 時使用。
---

# GitHub GraphQL API Best Practices Guide

## Rate Limiting（Points 系統）

GitHub GraphQL API 使用 **points 系統**，不是 REST 的 request count。

### Primary Rate Limits

| 認證方式 | Points/hr |
|----------|-----------|
| Personal Access Token | 5,000 |
| GitHub Enterprise Cloud | 10,000 |
| GitHub App（非 Enterprise） | 5,000 base + 50/repo + 50/user（cap 12,500） |
| GitHub Actions | 1,000/repo（Enterprise 15,000） |

### Secondary Rate Limits（每分鐘）

| 端點 | 限制 |
|------|------|
| GraphQL | 2,000 points/min |
| REST | 900 points/min |
| 並發請求 | 最多 100 個 |

Secondary limit 的計算不同於 primary：
- **Query（無 mutation）**：1 point
- **Query with mutation**：5 points

### 查詢 Rate Limit 狀態

```typescript
import { graphql } from "@octokit/graphql";

const graphqlWithAuth = graphql.defaults({
  headers: { authorization: `token ${process.env.GITHUB_TOKEN}` },
});

const { rateLimit } = await graphqlWithAuth<{
  rateLimit: { limit: number; cost: number; remaining: number; resetAt: string };
}>(`
  query {
    rateLimit {
      limit
      cost
      remaining
      resetAt
      nodeCount
    }
  }
`);

console.log(`Cost: ${rateLimit.cost}, Remaining: ${rateLimit.remaining}`);
```

Response headers 也有：
- `x-ratelimit-limit`：最大 points/hr
- `x-ratelimit-remaining`：剩餘 points
- `x-ratelimit-used`：已用 points
- `x-ratelimit-reset`：重置時間（UTC epoch）

## Query Cost 計算

**公式**：加總每個 connection 需要的 requests，每個 request 假設達到 `first`/`last` 上限，除以 100 後取最近整數，最低 1 point。

### 範例

```graphql
query {
  search(query: "location:Taiwan", type: USER, first: 100) {  # 100/100 = 1
    nodes {
      ... on User {
        repositories(first: 10) {  # 100 * 10 / 100 = 10
          nodes { name }
        }
      }
    }
  }
}
# 總 cost = 1 + 10 = 11 points
```

**最佳化原則**：減少巢狀 connection 的 `first` 值可大幅降低 cost。

## Node Limits

- 單次查詢最多 **500,000 nodes**
- `first`/`last` 值必須在 **1–100** 之間
- Node 計算方式：各層 connection 的 `first`/`last` **相乘**
  - 50 repos × 10 issues = 550 nodes（50 + 50×10）

## Search API（type: USER）

### 基本查詢

```typescript
import { graphql } from "@octokit/graphql";

const graphqlWithAuth = graphql.defaults({
  headers: { authorization: `token ${process.env.GITHUB_TOKEN}` },
});

interface SearchUsersResult {
  search: {
    userCount: number;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: Array<{
      login: string;
      name: string | null;
      followers: { totalCount: number };
      repositories: { totalCount: number };
      contributionsCollection: {
        contributionCalendar: { totalContributions: number };
      };
    }>;
  };
}

const SEARCH_USERS_QUERY = `
  query SearchUsers($query: String!, $first: Int!, $after: String) {
    search(query: $query, type: USER, first: $first, after: $after) {
      userCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ... on User {
          login
          name
          followers { totalCount }
          repositories(ownerAffiliations: OWNER) { totalCount }
          contributionsCollection {
            contributionCalendar { totalContributions }
          }
        }
      }
    }
    rateLimit { cost remaining resetAt }
  }
`;

const result = await graphqlWithAuth<SearchUsersResult>(SEARCH_USERS_QUERY, {
  query: "location:Taiwan followers:>50",
  first: 100,
  after: null,
});
```

### Search Query 語法

- `location:Taiwan` — 位置
- `followers:>100` / `followers:50..200` — 追蹤者範圍
- `repos:>10` — repo 數
- `language:TypeScript` — 主要語言
- `type:user` / `type:org` — 帳號類型
- `created:>2020-01-01` — 建立日期
- 空格 = AND 組合

### 重要限制：1000 筆結果上限

Search API **硬性限制最多回傳 1000 筆結果**，無論 pagination 如何設定。這是 GitHub 後端限制，REST 和 GraphQL 皆然。

#### 突破 1000 限制的策略

```typescript
// 策略：用 followers 範圍切分查詢
const followerRanges = [
  "followers:>1000",
  "followers:501..1000",
  "followers:201..500",
  "followers:101..200",
  "followers:51..100",
  "followers:21..50",
  "followers:11..20",
  "followers:1..10",
];

async function searchAllUsers(location: string): Promise<User[]> {
  const allUsers: User[] = [];

  for (const range of followerRanges) {
    const query = `location:${location} ${range}`;
    const users = await paginateSearch(query);
    allUsers.push(...users);

    // 如果某個範圍還是 >1000，需要再細分
    if (users.length >= 1000) {
      console.warn(`Range "${range}" hit 1000 cap, needs finer splitting`);
    }
  }

  return deduplicateByLogin(allUsers);
}
```

#### 自動細分範圍

```typescript
async function adaptiveSearch(
  location: string,
  minFollowers: number,
  maxFollowers: number,
): Promise<User[]> {
  const query = `location:${location} followers:${minFollowers}..${maxFollowers}`;

  // 先查 userCount
  const { search } = await graphqlWithAuth<SearchUsersResult>(SEARCH_USERS_QUERY, {
    query,
    first: 1,
    after: null,
  });

  if (search.userCount <= 1000) {
    return paginateSearch(query);
  }

  // 超過 1000，二分法細分
  const mid = Math.floor((minFollowers + maxFollowers) / 2);
  const lower = await adaptiveSearch(location, minFollowers, mid);
  const upper = await adaptiveSearch(location, mid + 1, maxFollowers);
  return [...lower, ...upper];
}
```

## Cursor-Based Pagination

### 完整分頁實作

```typescript
async function paginateSearch(searchQuery: string): Promise<User[]> {
  const allUsers: User[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const result = await graphqlWithAuth<SearchUsersResult>(SEARCH_USERS_QUERY, {
      query: searchQuery,
      first: 100, // 永遠用最大值 100
      after: cursor,
    });

    const { search, rateLimit } = result as any;

    // 過濾 null nodes（Organization 不符合 User fragment 時會是 null）
    const users = search.nodes.filter((node: any) => node !== null && node.login);
    allUsers.push(...users);

    hasNextPage = search.pageInfo.hasNextPage;
    cursor = search.pageInfo.endCursor;

    // 監控 rate limit
    if (rateLimit.remaining < 100) {
      const resetAt = new Date(rateLimit.resetAt);
      const waitMs = resetAt.getTime() - Date.now() + 1000;
      if (waitMs > 0) {
        console.log(`Rate limit low (${rateLimit.remaining}), waiting ${waitMs}ms`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
  }

  return allUsers;
}
```

### Pagination 要點

- **永遠用 `first: 100`**：減少 API 呼叫次數
- **Forward pagination**：`first` + `after` + `endCursor` + `hasNextPage`
- **Backward pagination**：`last` + `before` + `startCursor` + `hasPreviousPage`
- **`after: null`** 表示第一頁
- **PageInfo 四欄位**：`endCursor`、`startCursor`、`hasNextPage`、`hasPreviousPage`

## Batch Queries（批次查詢）

### 用 Alias 合併多個使用者查詢

```typescript
function buildBatchUserQuery(logins: string[]): string {
  const fragments = logins.map(
    (login, i) => `
    user${i}: user(login: "${login}") {
      login
      name
      followers { totalCount }
      repositories(ownerAffiliations: OWNER) { totalCount }
      contributionsCollection {
        contributionCalendar { totalContributions }
      }
    }
  `
  );

  return `query BatchUsers {
    ${fragments.join("\n")}
    rateLimit { cost remaining resetAt }
  }`;
}

// 每批最多 ~50 個使用者（避免超過 node limit 和 query 大小限制）
async function batchFetchUsers(logins: string[]): Promise<Map<string, User>> {
  const BATCH_SIZE = 50;
  const results = new Map<string, User>();

  for (let i = 0; i < logins.length; i += BATCH_SIZE) {
    const batch = logins.slice(i, i + BATCH_SIZE);
    const query = buildBatchUserQuery(batch);
    const data = await graphqlWithAuth(query);

    for (let j = 0; j < batch.length; j++) {
      const userData = (data as any)[`user${j}`];
      if (userData) {
        results.set(userData.login, userData);
      }
    }
  }

  return results;
}
```

### Batch Query Cost

Alias 查詢中，每個 `user(login:)` 是獨立 node request，cost = alias 數量 / 100（最低 1）。比 N 次獨立查詢（N points）便宜很多。

## Error Handling

### GraphQL Error 結構

```typescript
import { GraphqlResponseError } from "@octokit/graphql";

interface GraphQLError {
  type: string;          // "RATE_LIMITED" | "NOT_FOUND" | "FORBIDDEN" 等
  message: string;
  path?: string[];
  locations?: Array<{ line: number; column: number }>;
}

async function safeGraphqlQuery<T>(query: string, variables: Record<string, unknown>): Promise<T | null> {
  try {
    return await graphqlWithAuth<T>(query, variables);
  } catch (error) {
    if (error instanceof GraphqlResponseError) {
      // GraphQL 回傳了 data + errors
      const errors = error.errors ?? [];

      for (const err of errors) {
        switch (err.type) {
          case "RATE_LIMITED":
            console.error("Rate limited, waiting...");
            await waitForRateLimit();
            return safeGraphqlQuery<T>(query, variables);

          case "NOT_FOUND":
            console.warn(`Resource not found: ${err.path?.join(".")}`);
            return error.data as T; // partial data 仍可用

          case "FORBIDDEN":
            console.error(`Permission denied: ${err.message}`);
            return null;

          default:
            console.error(`GraphQL error: ${err.type} - ${err.message}`);
        }
      }
    }

    // Network error 或其他
    if ((error as any).status === 502) {
      console.warn("GitHub 502, retrying...");
      await new Promise((r) => setTimeout(r, 2000));
      return safeGraphqlQuery<T>(query, variables);
    }

    throw error;
  }
}
```

### 常見錯誤碼

| Error Type | 原因 | 處理方式 |
|-----------|------|---------|
| `RATE_LIMITED` | 超過 rate limit | 等待 `resetAt` 後重試 |
| `NOT_FOUND` | User/Repo 不存在 | 跳過，partial data 可能可用 |
| `FORBIDDEN` | Token 權限不足 | 檢查 scope |
| `MAX_NODE_LIMIT_EXCEEDED` | 超過 500K nodes | 減少 `first`/巢狀深度 |
| `QUERY_COMPLEXITY` | Query 太複雜 | 拆分 query |
| Network 502/503 | GitHub 暫時錯誤 | 指數退避重試 |

### Partial Data 處理

GraphQL 可能回傳 **data + errors 同時存在**。例如查詢 10 個 user，其中 1 個不存在：

```typescript
// response.data 有 9 個 user 的資料
// response.errors 有 1 個 NOT_FOUND
// 不要因為 errors 就丟掉全部 data！
```

## Authentication Scopes

### 本專案需要的最小 scope（Personal Access Token）

| Scope | 用途 |
|-------|------|
| `read:user` | 讀取使用者 profile（必要） |
| `user:email` | 讀取使用者 email（可選） |
| `repo`（public_repo） | 讀取 public repo 資料 |
| `read:org` | 讀取 organization 成員資料（可選） |

### Fine-Grained Personal Access Token（推薦）

Fine-grained token 可以更精確控制權限：
- **Account permissions** > **Followers**: Read-only
- **Repository permissions** > **Metadata**: Read-only

### 認證設定

```typescript
import { graphql } from "@octokit/graphql";

// 方式 1：直接設定
const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`,
  },
});

// 方式 2：透過 Octokit
import { Octokit } from "@octokit/rest";
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const data = await octokit.graphql(query, variables);
```

## 常見陷阱

1. **Search 結果硬上限 1000 筆** — 必須用 followers 範圍切分突破
2. **`first`/`last` 最大 100** — 設超過會 error
3. **Node limit 500,000** — 巢狀 connection 相乘容易爆
4. **GraphQL rate limit 是 points 不是 requests** — 一個複雜 query 可能消耗幾十 points
5. **Secondary rate limit 2000 pts/min** — 快速連續查詢會觸發
6. **Search 回傳 null nodes** — `type: USER` 查詢仍可能包含 Organization，需過濾
7. **Partial errors** — GraphQL 可能同時回傳 data 和 errors，不要丟掉 partial data
8. **`userCount` 是估計值** — Search API 的 `userCount` 不一定精確
9. **Cursor 不可跨查詢使用** — 每個 search query 的 cursor 獨立
10. **Contribution data 需要日期範圍** — `contributionsCollection` 的 `from`/`to` 跨度最多一年

## 與 Octokit REST 對照

| 需求 | REST | GraphQL |
|------|------|---------|
| 搜尋使用者 | `GET /search/users`（30 req/min） | `search(type: USER)`（points 系統） |
| 使用者 profile | `GET /users/{login}` | `user(login:)` |
| Contribution 資料 | ❌ 不支援 | `contributionsCollection` |
| 批次查詢多個使用者 | N 個 requests | 1 個 query with aliases |
| Rate limit | 5000 req/hr | 5000 points/hr |
| 自訂回傳欄位 | ❌ 固定格式 | ✅ 只取需要的 |
