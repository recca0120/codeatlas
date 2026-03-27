---
name: octokit
description: Octokit.js (@octokit/rest) GitHub API 最佳實踐指南。當需要使用 GitHub REST/GraphQL API、設定 rate limiting、pagination、搜尋使用者、取得 contribution 資料時使用。
---

# Octokit.js Best Practices Guide

## 版本資訊

| 套件 | 版本 |
|------|------|
| `@octokit/rest` | 22.0.1 |
| `@octokit/core` | 7.0.6 |
| `@octokit/plugin-throttling` | 11.0.3 |
| `@octokit/plugin-retry` | 8.1.0 |

## TypeScript 設定（必須）

所有 `@octokit/*` 套件使用 conditional exports：

```json
{
  "compilerOptions": {
    "moduleResolution": "node16",
    "module": "node16"
  }
}
```

## 推薦設定

```typescript
import { Octokit } from "@octokit/rest";
import { throttling } from "@octokit/plugin-throttling";
import { retry } from "@octokit/plugin-retry";

const MyOctokit = Octokit.plugin(throttling, retry);

const octokit = new MyOctokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: "gitstar/1.0.0",
  throttle: {
    onRateLimit: (retryAfter, options, octokit, retryCount) => {
      octokit.log.warn(
        `Rate limit for ${options.method} ${options.url} (retry ${retryCount + 1}, wait ${retryAfter}s)`
      );
      return retryCount < 2; // 重試兩次
    },
    onSecondaryRateLimit: (retryAfter, options, octokit) => {
      octokit.log.error(`Secondary rate limit for ${options.method} ${options.url}`);
      return false; // 不重試，需要調查原因
    },
  },
  retry: { doNotRetry: [400, 401, 403, 404, 422] },
  request: { retries: 3 },
});
```

## Plugin 組合模式

`Octokit.plugin()` 回傳**新 class**（不修改原始）：

```typescript
const MyOctokit = Octokit.plugin(throttling, retry); // 新 constructor
const octokit = new MyOctokit({ /* options */ });
```

## Pagination

### 收集所有頁面

```typescript
const allUsers = await octokit.paginate(octokit.rest.search.users, {
  q: "location:Taiwan followers:>50",
  sort: "followers",
  order: "desc",
  per_page: 100, // 永遠設 100，減少 API 呼叫
});
```

### Async Iterator（可提前中斷）

```typescript
for await (const response of octokit.paginate.iterator(
  octokit.rest.repos.listForOrg,
  { org: "octokit", per_page: 100 }
)) {
  for (const repo of response.data) {
    // 可以 break
  }
}
```

### Map Function（只取需要的欄位）

```typescript
const names = await octokit.paginate(
  octokit.rest.repos.listForOrg,
  { org: "octokit", per_page: 100 },
  (response) => response.data.map((repo) => repo.full_name)
);
```

## Search Users API

```typescript
const { data } = await octokit.rest.search.users({
  q: "location:Taiwan followers:>100",
  sort: "followers",    // "followers" | "repositories" | "joined"
  order: "desc",
  per_page: 100,
});
```

### Search Query 語法

- `location:Taiwan` — 位置
- `followers:>100` — 追蹤者數
- `repos:>10` — repo 數
- `language:TypeScript` — 主要語言
- `type:user` 或 `type:org`
- 空格 = AND 組合

### Rate Limits

| 端點 | 限制 |
|------|------|
| Search API | **30 req/min**（authenticated） |
| Core API | 5,000 req/hr（authenticated） |
| Unauthenticated | 60 req/hr |

## Contribution 資料（僅 GraphQL）

REST API **沒有** contribution 端點，必須用 GraphQL：

```typescript
const query = `
  query ($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
        }
        restrictedContributionsCount
      }
    }
  }
`;

const data = await octokit.graphql(query, {
  username: "octocat",
  from: "2025-01-01T00:00:00Z",
  to: "2025-12-31T23:59:59Z",
});
```

## 錯誤處理

```typescript
import { RequestError } from "@octokit/request-error";

try {
  await octokit.rest.repos.get({ owner, repo });
} catch (error) {
  if (error instanceof RequestError) {
    console.error(`Status: ${error.status}, Message: ${error.message}`);
    if (error.status === 403) {
      const retryAfter = error.response?.headers["retry-after"];
    }
  }
}
```

## TypeScript 型別

```typescript
import type { Endpoints } from "@octokit/types";

// 端點回應型別
type SearchUsersResponse = Endpoints["GET /search/users"]["response"];
type UserData = Endpoints["GET /users/{username}"]["response"]["data"];

// 端點參數型別
type SearchUsersParams = Endpoints["GET /search/users"]["parameters"];
```

## 測試策略

### 1. DI + Fake（推薦用於單元測試）

```typescript
interface GitHubClient {
  searchUsers(query: string, page: number): Promise<GitHubUser[]>;
}

// Production
class OctokitGitHubClient implements GitHubClient { /* ... */ }

// Test
class FakeGitHubClient implements GitHubClient {
  async searchUsers() { return [{ login: "test" }]; }
}
```

### 2. MSW（推薦用於整合測試）

```typescript
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  http.get("https://api.github.com/search/users", ({ request }) => {
    return HttpResponse.json({
      total_count: 1,
      incomplete_results: false,
      items: [{ login: "testuser", id: 1, type: "User" }],
    });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 常見陷阱

1. **Search 結果上限 1000** — 需要細分查詢（如依 follower 範圍）
2. **Search rate limit 30/min** — 迴圈中容易超過，務必用 throttling plugin
3. **per_page 預設 30** — 永遠設 100
4. **moduleResolution 必須是 node16** — 否則 import 失敗
5. **Secondary rate limits** — 快速並發請求觸發，在操作間加延遲
6. **Contribution 資料只有 GraphQL** — 沒有 REST 端點
7. **Plugin 組合是不可變的** — `Octokit.plugin(X)` 回傳新 class
8. **未認證 = 60 req/hr** — 永遠帶 token
