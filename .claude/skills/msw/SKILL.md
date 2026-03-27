---
name: msw
description: MSW (Mock Service Worker) 2.x 最佳實踐指南。當需要在 Vitest 中攔截 HTTP 請求、測試 API 整合（含 Octokit）、模擬錯誤/rate limiting、或組織 mock handlers 時使用。
---

# MSW (Mock Service Worker) Best Practices Guide (2.x)

## 版本資訊

- 最新穩定版：**MSW 2.12.14**
- 需要 Node.js >= 18
- MSW 2.x 原生支援 Fetch API，不需要額外 adapter

```bash
npm install -D msw
```

## Vitest 整合設定

### 建立 handlers

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("https://api.github.com/users/:username", ({ params }) => {
    return HttpResponse.json({
      login: params.username,
      name: "Test User",
      followers: 100,
    });
  }),
];
```

### 建立 server

```typescript
// src/mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

### Setup file

```typescript
// vitest.setup.ts
import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./src/mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Vitest config

```typescript
// vitest.config.ts
test: {
  setupFiles: ["./vitest.setup.ts"],
}
```

**三個 lifecycle hook 缺一不可**：
- `server.listen()` — 啟用攔截
- `server.resetHandlers()` — 移除 `server.use()` 的覆蓋
- `server.close()` — 還原原始網路行為

## Handler 模式

### 基本 CRUD

```typescript
import { http, HttpResponse } from "msw";

// GET + path params
http.get("/users/:id", ({ params }) => {
  return HttpResponse.json({ id: params.id, name: "Alice" });
});

// POST + request body
http.post("/users", async ({ request }) => {
  const body = await request.json();
  return HttpResponse.json({ id: 1, ...body }, { status: 201 });
});

// DELETE
http.delete("/users/:id", () => {
  return new HttpResponse(null, { status: 204 });
});

// Catch-all
http.all("/analytics/*", () => new HttpResponse(null, { status: 200 }));
```

### Query Params

**不要放在 handler URL 裡**，從 `request.url` 讀取：

```typescript
http.get("https://api.github.com/search/users", ({ request }) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const page = Number(url.searchParams.get("page") || "1");
  return HttpResponse.json({ total_count: 1, items: [{ login: "alice" }] });
});
```

### TypeScript 型別

```typescript
http.post<
  { owner: string; repo: string },  // path params
  { title: string },                  // request body
  { id: number; number: number }      // response body
>(
  "https://api.github.com/repos/:owner/:repo/issues",
  async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 1, number: 42 });
  }
);
```

## HttpResponse 方法

```typescript
HttpResponse.json({ key: "value" })              // application/json
HttpResponse.json({ error: "Not found" }, { status: 404 })
HttpResponse.text("Hello")                        // text/plain
HttpResponse.html("<p>Hello</p>")                 // text/html
HttpResponse.xml("<root><id>1</id></root>")       // application/xml
HttpResponse.error()                               // 網路錯誤（連線失敗）
new HttpResponse(null, { status: 204 })            // 自訂 status
```

## 測試覆蓋（server.use）

單一測試的覆蓋，`afterEach` 的 `resetHandlers()` 會自動移除：

```typescript
it("handles server error", async () => {
  server.use(
    http.get("/api/data", () => {
      return HttpResponse.json({ error: "Internal" }, { status: 500 });
    })
  );
  // ... 測試錯誤路徑
});

it("handles network failure", async () => {
  server.use(
    http.get("/api/data", () => HttpResponse.error())
  );
});
```

### 連續不同回應

```typescript
server.use(
  http.get("/api/data", () => HttpResponse.json({ first: true }), { once: true }),
  http.get("/api/data", () => HttpResponse.json({ second: true })),
);
```

## 錯誤模擬

```typescript
// HTTP 錯誤
http.get("/api", () => HttpResponse.json({ message: "Forbidden" }, { status: 403 }));

// 網路錯誤
http.get("/api", () => HttpResponse.error());

// Timeout
import { delay } from "msw";
http.get("/api", async () => {
  await delay(30_000);
  return HttpResponse.json({ data: "late" });
});

// Rate limiting
http.get("/api", () => {
  return HttpResponse.json(
    { message: "Rate limit exceeded" },
    { status: 429, headers: { "Retry-After": "60" } }
  );
});
```

## 測試 Octokit

Octokit 發 HTTP 到 `https://api.github.com`，MSW 直接攔截：

```typescript
import { http, HttpResponse } from "msw";

export const githubHandlers = [
  // Search users
  http.get("https://api.github.com/search/users", ({ request }) => {
    const url = new URL(request.url);
    return HttpResponse.json({
      total_count: 1,
      incomplete_results: false,
      items: [{ login: "alice", id: 1, avatar_url: "https://..." }],
    });
  }),

  // Get user profile
  http.get("https://api.github.com/users/:username", ({ params }) => {
    return HttpResponse.json({
      login: params.username,
      name: "Alice",
      followers: 100,
      company: "ACME",
      location: "Taipei",
    });
  }),

  // GraphQL (contribution data)
  http.post("https://api.github.com/graphql", async ({ request }) => {
    return HttpResponse.json({
      data: {
        user: {
          contributionsCollection: {
            contributionCalendar: { totalContributions: 365 },
          },
        },
      },
    });
  }),

  // Rate limit
  http.get("https://api.github.com/rate_limit", () => {
    return HttpResponse.json({
      rate: { remaining: 4999, reset: Math.floor(Date.now() / 1000) + 3600 },
    });
  }),
];
```

```typescript
// test
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: "fake-token" });

it("searches users", async () => {
  const { data } = await octokit.rest.search.users({ q: "location:Taiwan" });
  expect(data.items).toHaveLength(1);
  expect(data.items[0].login).toBe("alice");
});
```

## msw-fetch-mock

`msw-fetch-mock` 提供 Undici 風格的 chainable fetch mock API，建構在 MSW 之上。

**何時使用**：
- 偏好 fluent/chainable 語法
- 從 `undici.MockAgent` 遷移
- 需要內建呼叫歷史追蹤（`fetchMock.calls`、`lastCall()`）

**MSW 2.x 原生已足夠**，`msw-fetch-mock` 是可選的便利工具。

## Handler 組織

```
src/mocks/
  handlers/
    github.ts    # GitHub API handlers
    auth.ts      # Auth handlers
    index.ts     # Re-exports all handlers
  server.ts      # setupServer(...allHandlers)
```

```typescript
// src/mocks/handlers/index.ts
import { githubHandlers } from "./github";
export const handlers = [...githubHandlers];
```

**原則**：base handlers 覆蓋 happy path，`server.use()` 只用於測試特定覆蓋（錯誤、edge case）。

## 常見陷阱

1. **忘記 `resetHandlers()`** — `server.use()` 覆蓋洩漏到後續測試
2. **Query params 放在 handler URL** — 用 `new URL(request.url).searchParams`
3. **未 await `request.json()`** — body 方法都是 async
4. **Node.js 用相對 URL** — 必須用絕對 URL
5. **從 `msw` import `setupServer`** — 必須從 `msw/node` import
6. **未設 `onUnhandledRequest: "error"`** — 預設靜默通過，設為 error 及早發現問題
7. **全域和單檔都呼叫 `server.listen()`** — 只在 setup file 呼叫一次
8. **連續呼叫不同回應忘記 `{ once: true }`** — 需要堆疊 handler
