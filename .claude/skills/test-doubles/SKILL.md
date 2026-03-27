---
name: test-doubles
description: Test Doubles 最佳實踐指南，包含五種類型詳解與使用優先順序。當需要選擇 Mock/Stub/Fake/Spy/Dummy、或討論測試隔離策略時使用。
---

# Test Doubles Best Practices Guide (2025-2026)

## 五種 Test Doubles

| 類型 | 定義 | 用途 |
|------|------|------|
| **Dummy** | 傳遞但從未使用的物件，填充參數列表 | 滿足型別要求 |
| **Stub** | 提供預定義（canned）回應 | 狀態驗證：檢查 SUT 的結果 |
| **Spy** | Stub + 記錄呼叫資訊 | 事後驗證互動 |
| **Mock** | 預設期望的呼叫，自身驗證失敗 | 行為驗證（最嚴格） |
| **Fake** | 完整但簡化的實作（不適合 production） | 有真實邏輯、維護狀態 |

## 優先順序（從高到低）

```
1. Real Implementation  ← 最優先：快速、確定性、簡單依賴
2. Fake                 ← 次佳：忠實行為、維護狀態
3. Stub                 ← 回傳固定值：用於狀態驗證
4. Spy                  ← Stub + 呼叫記錄：需要驗證呼叫時
5. Mock                 ← 最後手段：嚴格行為驗證、最多耦合
```

## 決策樹

```
能用真實物件嗎？
  ├─ YES → 用真實實作
  └─ NO → 依賴是否複雜且有狀態？
       ├─ YES → 寫 Fake
       └─ NO → 需要驗證互動嗎？
            ├─ NO  → 用 Stub（回傳固定資料）
            └─ YES → 需要事前期望還是事後檢查？
                 ├─ 事後 → 用 Spy
                 └─ 事前 → 用 Mock（最後手段）
```

## 何時用真實實作

- 依賴是 **value object**（金額、日期、集合）
- **快速**（< 幾 ms）、**確定性**、**無外部 I/O**
- **純邏輯**（validator、parser、formatter、calculator）

## 何時用 Test Doubles

- **網路 I/O**（HTTP API、資料庫）
- **不確定性**（時間、亂數、系統狀態）
- **緩慢**（> 100ms）
- **副作用**（寄信、扣款）

## Vitest 對應

```typescript
// DUMMY — 填充參數
const dummyLogger: Logger = { log: () => {}, error: () => {} };

// STUB — vi.fn() 回傳固定值
const getUser = vi.fn().mockReturnValue({ id: 1, name: 'Alice' });

// SPY — 觀察真實行為
const spy = vi.spyOn(userService, 'save');
// ... 執行程式碼 ...
expect(spy).toHaveBeenCalledWith({ id: 1, name: 'Alice' });

// MOCK — 替換整個模組（vi.mock 會被 hoisted）
vi.mock('./emailService', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

// FAKE — 真實運作的簡化實作
class FakeUserRepository implements UserRepository {
  private users = new Map<string, User>();
  async findById(id: string) { return this.users.get(id) ?? null; }
  async save(user: User) { this.users.set(user.id, user); }
}
```

## 偏好 vi.spyOn 而非 vi.mock

| | vi.spyOn | vi.mock |
|---|---|---|
| 範圍 | 區域性，單一方法 | 全檔案，整個模組 |
| 型別安全 | 是 | 較弱 |
| 保留原始 | 預設保留 | 全部替換 |
| Hoisting | 不會 | 會被提升到檔案頂部 |

**vi.mock 是 footgun** — hoisting 行為和全檔案範圍讓測試難以推理。預設用 vi.spyOn。

## Sociable vs Solitary Tests

### Sociable Tests（社交型）
- 允許 SUT 與真實協作者互動
- Chicago/Classicist 風格
- **2025 共識：這是預設選擇**

### Solitary Tests（獨立型）
- 所有協作者替換為 test doubles
- London/Mockist 風格
- **只在邊界使用**（外部服務、I/O）

Google 經驗：大量 mock 的獨立測試「需要持續維護但很少發現 bug」。

## Anti-Patterns

### Over-Mocking
一個測試需要 5+ mock → 設計有太多依賴，重構 production code。

### Testing Implementation Details
```typescript
// 壞 — 耦合實作
expect(mockRepo.save).toHaveBeenCalledTimes(1);

// 好 — 驗證狀態/結果
const saved = await fakeRepo.findByName('Alice');
expect(saved).not.toBeNull();
```

### Fragile Tests
每次重構都壞 → 測試耦合了內部細節而非行為。

## Don't Mock What You Don't Own

不要直接 mock 第三方 API，而是：

1. 建立自己的 **wrapper/adapter**
2. Mock/Fake **你的 wrapper**
3. 用**整合測試**驗證 wrapper 與真實服務

```typescript
// 壞 — 直接 mock fetch
vi.mock('node-fetch');

// 好 — 擁有自己的介面
interface HttpClient {
  get<T>(url: string): Promise<T>;
}

class FakeHttpClient implements HttpClient {
  private responses = new Map<string, unknown>();
  stubGet(url: string, data: unknown) { this.responses.set(url, data); }
  async get<T>(url: string): Promise<T> {
    return this.responses.get(url) as T;
  }
}
```

## Dependency Injection（TypeScript）

DI 是可測試性的**最重要模式**。不需要框架 — constructor injection + interface 就夠了：

```typescript
// 1. 定義介面
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

// 2. Production 實作
class PostgresUserRepository implements UserRepository { /* SQL */ }

// 3. Fake
class FakeUserRepository implements UserRepository {
  private store = new Map<string, User>();
  async findById(id: string) { return this.store.get(id) ?? null; }
  async save(user: User) { this.store.set(user.id, user); }
}

// 4. Service 接受介面
class UserService {
  constructor(private repo: UserRepository) {}
}

// 5. 測試 — 注入 fake
it('creates a user', async () => {
  const repo = new FakeUserRepository();
  const service = new UserService(repo);
  const user = await service.createUser({ name: 'Alice' });
  expect(await repo.findById(user.id)).toEqual(user);
});
```

## 測試外部服務

### HTTP API
- **單元測試**：Fake HTTP client 或 stub
- **整合測試**：MSW（Mock Service Worker）攔截網路層
- **契約測試**：Pact 驗證消費者期望

```typescript
// MSW
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('https://api.github.com/users/:id', ({ params }) => {
    return HttpResponse.json({ id: params.id, name: 'Alice' });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 資料庫
- **單元測試**：FakeRepository（in-memory Map）
- **整合測試**：Testcontainers 或 SQLite in-memory

### 檔案系統
- **單元測試**：注入 FS 介面，提供 in-memory fake（memfs）
- **整合測試**：temp directory

## Fake vs Mock 比較

| 面向 | Fake | Mock |
|------|------|------|
| 忠實度 | 高 — 真實行為 | 低 — 固定回應 |
| 維護者 | 依賴的擁有者 | 每個測試作者 |
| 重構安全 | 耐重構 | 重構就壞 |
| 可讀性 | 像真實程式碼 | 像設定檔 |
| 初始成本 | 較高 | 較低 |
| 長期成本 | 較低（1 fake, N tests） | 較高（N mocks） |

**Google 指導**：對複雜依賴，Fake 優於 Mock。

## 契約測試

驗證 test doubles 忠實反映真實外部服務：

1. Consumer 用 stub/fake 寫測試
2. Stub 定義「契約」（預期 request/response）
3. 契約對真實 provider 做驗證
4. Provider 變更 → 契約測試失敗 → 更新 doubles

## 在 GitStar 專案的應用

| 元件 | 策略 |
|------|------|
| Country Config loader | Real — 純邏輯，快速 |
| GitHub API client | Fake HttpClient + MSW 整合測試 |
| Rate limiter | Fake timers（vi.useFakeTimers） |
| 排序/去重邏輯 | Real — 純函式 |
| Three.js renderer | Mock WebGLRenderer |
| OG image 產生 | Stub satori 回傳固定 SVG |
| File I/O | Fake FS 或 vi.mock('node:fs/promises') |
