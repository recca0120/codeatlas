---
name: svelte
description: Svelte 5 + Astro 整合最佳實踐指南。當需要建立 Svelte 元件、使用 runes API、整合 Astro islands、或用 Testing Library 測試 Svelte 元件時使用。
---

# Svelte 5 + Astro Guide (v5.53+)

## Runes API

### $state
```svelte
<script>
  let count = $state(0);
  let items = $state([{ text: "hello" }]); // deep reactive proxy
</script>
<button onclick={() => count++}>{count}</button>
```

`$state.raw()` — 無深層 proxy，需整個重新賦值：
```js
let data = $state.raw({ big: "object" });
data = { big: "new" }; // 觸發更新
```

`$state.snapshot()` — 提取 plain object（給外部 lib 用）。

### $derived
```js
let doubled = $derived(count * 2);
let total = $derived.by(() => items.reduce((s, i) => s + i.value, 0));
```

### $effect
```js
$effect(() => { console.log(count); }); // 自動追蹤依賴
$effect.pre(() => { /* beforeUpdate */ });
```

### $props
```svelte
<script lang="ts">
  let { name, age = 25, onchange }: {
    name: string;
    age?: number;
    onchange?: (val: string) => void;
  } = $props();
</script>
```

## 事件處理（Svelte 5）

不用 `on:` — 直接用 HTML 事件屬性：
```svelte
<button onclick={handler}>Click</button>
<button onclick={(e) => { e.preventDefault(); handler(e); }}>Click</button>
```

元件事件 = callback props：
```svelte
<!-- Parent -->
<Child onmessage={(msg) => console.log(msg)} />
<!-- Child -->
<script> let { onmessage } = $props(); </script>
<button onclick={() => onmessage?.("hello")}>Send</button>
```

## Snippets（取代 Slots）

```svelte
<!-- Parent -->
<Card>
  {#snippet header()}<h2>Title</h2>{/snippet}
  <p>Body (children)</p>
</Card>

<!-- Card.svelte -->
<script> let { header, children } = $props(); </script>
{@render header?.()}
{@render children()}
```

## Astro 整合

```js
// astro.config.mjs
import svelte from "@astrojs/svelte";
export default defineConfig({ integrations: [svelte()] });
```

```astro
<Counter client:load />      <!-- 立即 hydrate -->
<Chart client:visible />     <!-- 進入視窗才 hydrate -->
<Widget client:idle />       <!-- 瀏覽器 idle 時 hydrate -->
<App client:only="svelte" /> <!-- 純 client-side -->
```

不加 `client:*` = 靜態 HTML，零 JS。

### 傳資料給 Svelte
```astro
<Chart client:visible items={data} title="Sales" />
```
只接受可序列化型別。**不能傳 function**。

### 跨 island 共享狀態（Nanostores）
```bash
npm install nanostores @nanostores/svelte
```
```js
// stores/cart.ts
import { atom } from "nanostores";
export const isOpen = atom(false);
```
```svelte
<script>
  import { isOpen } from "../stores/cart";
</script>
<button onclick={() => isOpen.set(true)}>Open ({$isOpen})</button>
```

## 測試（Vitest + Testing Library）

```bash
npm install -D @testing-library/svelte @testing-library/jest-dom @testing-library/user-event
```

### vitest.config.ts
```ts
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [svelte(), svelteTesting()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest-setup.ts"],
  },
});
```

`svelteTesting()` 自動做兩件事：browser resolve condition + afterEach cleanup。可個別關閉：
```ts
svelteTesting({ autoCleanup: false, resolveBrowser: false })
```

### vitest-setup.ts
```ts
import "@testing-library/jest-dom/vitest";
```

tsconfig.json 加上：
```json
{ "compilerOptions": { "types": ["@testing-library/jest-dom"] } }
```

---

### 基本模式：render + props + user interaction

```ts
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import Counter from "./Counter.svelte";

test("increments on click", async () => {
  const user = userEvent.setup();
  render(Counter, { initial: 5 });
  expect(screen.getByRole("button")).toHaveTextContent("5");
  await user.click(screen.getByRole("button"));
  expect(screen.getByRole("button")).toHaveTextContent("6");
});
```

props 可直接攤平傳入，也可用 `{ props: { ... } }` 形式：
```ts
render(MyComponent, { name: "Alice" });
// 等同
render(MyComponent, { props: { name: "Alice" } });
```

### 更新 props（rerender）

```ts
test("reacts to prop changes", async () => {
  const { rerender } = render(Greeting, { name: "Alice" });
  expect(screen.getByText("Hello Alice")).toBeInTheDocument();
  await rerender({ name: "Bob" });
  expect(screen.getByText("Hello Bob")).toBeInTheDocument();
});
```

`rerender()` 內部用 `Object.assign` 更新 `$state` 化的 props，再 `await tick()`。

### 測試 $state + $derived

元件內的 `$state` / `$derived` 不需特殊處理 — 透過 DOM 驗證即可：

```svelte
<!-- PriceCalc.svelte -->
<script lang="ts">
  let { price, taxRate = 0.1 }: { price: number; taxRate?: number } = $props();
  let quantity = $state(1);
  let total = $derived(price * quantity * (1 + taxRate));
</script>
<input type="number" aria-label="quantity" bind:value={quantity} />
<p data-testid="total">{total}</p>
```

```ts
test("derived total updates when quantity changes", async () => {
  const user = userEvent.setup();
  render(PriceCalc, { price: 100 });

  expect(screen.getByTestId("total")).toHaveTextContent("110"); // 100*1*1.1

  const input = screen.getByLabelText("quantity");
  await user.clear(input);
  await user.type(input, "3");

  expect(screen.getByTestId("total")).toHaveTextContent("330"); // 100*3*1.1
});
```

### 測試 $effect（async data loading）

$effect 中的非同步操作需搭配 `waitFor` 或 `findBy*`：

```svelte
<!-- UserProfile.svelte -->
<script lang="ts">
  import { fetchUser } from "./api";
  let { userId }: { userId: string } = $props();
  let user = $state<{ name: string } | null>(null);
  let loading = $state(true);

  $effect(() => {
    loading = true;
    fetchUser(userId).then((u) => {
      user = u;
      loading = false;
    });
  });
</script>
{#if loading}<p>Loading...</p>{/if}
{#if user}<p>{user.name}</p>{/if}
```

```ts
import { render, screen, waitFor } from "@testing-library/svelte";
import { vi } from "vitest";

// Mock 模組
vi.mock("./api", () => ({
  fetchUser: vi.fn(),
}));

import { fetchUser } from "./api";
import UserProfile from "./UserProfile.svelte";

test("loads and displays user", async () => {
  vi.mocked(fetchUser).mockResolvedValue({ name: "Alice" });

  render(UserProfile, { userId: "1" });
  expect(screen.getByText("Loading...")).toBeInTheDocument();

  // findBy* 自帶 waitFor，等待元素出現
  expect(await screen.findByText("Alice")).toBeInTheDocument();
});
```

### Mock imports（vi.mock）

```ts
// Mock 整個模組
vi.mock("./api", () => ({
  fetchUsers: vi.fn().mockResolvedValue([]),
}));

// Mock default export（如 Svelte component）
vi.mock("./HeavyChart.svelte", () => ({
  default: { /* mock component */ },
}));

// Mock 部分匯出，保留其餘
vi.mock("./utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./utils")>();
  return { ...actual, expensiveCalc: vi.fn().mockReturnValue(42) };
});
```

每次測試後記得清理：
```ts
afterEach(() => {
  vi.restoreAllMocks();
});
```

### 測試 `{#each}` 迴圈 + 過濾列表（保留原始排名）

常見場景：列表有 filter 但顯示的 rank 需保持原始位置。

```svelte
<!-- Leaderboard.svelte -->
<script lang="ts">
  let { users }: { users: { rank: number; name: string; score: number }[] } = $props();
  let filter = $state("");
  let filtered = $derived(
    users.filter((u) => u.name.toLowerCase().includes(filter.toLowerCase()))
  );
</script>
<input aria-label="filter" bind:value={filter} />
<table>
  <tbody>
    {#each filtered as user (user.rank)}
      <tr><td>{user.rank}</td><td>{user.name}</td><td>{user.score}</td></tr>
    {/each}
  </tbody>
</table>
```

```ts
test("filtering preserves original rank", async () => {
  const user = userEvent.setup();
  const users = [
    { rank: 1, name: "Alice", score: 100 },
    { rank: 2, name: "Bob", score: 90 },
    { rank: 3, name: "Alicia", score: 80 },
  ];
  render(Leaderboard, { users });

  // 初始 3 列
  expect(screen.getAllByRole("row")).toHaveLength(3);

  // 輸入 filter
  await user.type(screen.getByLabelText("filter"), "Ali");

  // 剩 2 列，但 rank 保持原始值
  const rows = screen.getAllByRole("row");
  expect(rows).toHaveLength(2);
  expect(rows[0]).toHaveTextContent("1"); // Alice rank=1
  expect(rows[1]).toHaveTextContent("3"); // Alicia rank=3
});
```

### 測試 select 下拉選單

```ts
test("select changes category", async () => {
  const user = userEvent.setup();
  render(FilterPanel);

  await user.selectOptions(screen.getByRole("combobox"), "technology");
  expect(screen.getByRole("combobox")).toHaveValue("technology");
});
```

### 測試 callback props（Svelte 5 事件模式）

```ts
test("calls onsubmit with form data", async () => {
  const handleSubmit = vi.fn();
  const user = userEvent.setup();

  render(LoginForm, { onsubmit: handleSubmit });
  await user.type(screen.getByLabelText("Email"), "a@b.com");
  await user.click(screen.getByRole("button", { name: "Submit" }));

  expect(handleSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ email: "a@b.com" })
  );
});
```

### 測試 context

```ts
import { render } from "@testing-library/svelte";

render(MyComponent, {
  props: { name: "test" },
  context: new Map([["theme", "dark"]]),
});
```

### 低階 mount + flushSync

不用 Testing Library 時，直接用 Svelte API：
```ts
import { mount, unmount, flushSync } from "svelte";

test("low level mount", () => {
  const target = document.createElement("div");
  document.body.appendChild(target);

  const component = mount(Counter, { target, props: { initial: 0 } });
  target.querySelector("button")!.click();
  flushSync(); // 強制同步更新 DOM
  expect(target.querySelector("button")!.textContent).toBe("1");

  unmount(component);
  target.remove();
});
```

### 測試 runes 邏輯（不渲染元件）

檔名必須是 `.svelte.test.ts`：
```ts
// counter.svelte.test.ts
import { flushSync } from "svelte";

test("reactive state without component", () => {
  let count = $state(0);
  let doubled = $derived(count * 2);

  expect(doubled).toBe(0);
  count = 5;
  // $derived 在同步 context 中自動更新
  expect(doubled).toBe(10);
});

test("effect runs on state change", () => {
  const log: number[] = [];
  const cleanup = $effect.root(() => {
    let count = $state(0);

    $effect(() => {
      log.push(count);
    });

    flushSync(); // 觸發 pending effects
    expect(log).toEqual([0]);

    count = 1;
    flushSync();
    expect(log).toEqual([0, 1]);
  });
  cleanup(); // 清除 effect root
});
```

---

### 重要注意事項

1. **使用 runes 的測試檔必須含 `.svelte`**（如 `.svelte.ts`、`.svelte.test.ts`），否則 `$state` / `$derived` 等 runes 不會被編譯
2. **用 `svelteTesting()` plugin** — 自動處理 browser resolve + cleanup
3. **低階 `mount()` 測試需要 `flushSync()`** — Testing Library 的 `fireEvent` / `act` 已自動處理
4. **解構會斷開 reactivity** — 用 getter 或直接存取
5. **Snippets 不能從測試傳入** — 建立 wrapper component
6. **`$effect` 中的非同步操作**（await / setTimeout 之後）不會被追蹤依賴 — 用 `waitFor` 或 `findBy*` 等待 DOM 更新
7. **外部 `.svelte.ts` 模組的狀態變更**需要 `flushSync()` 才能觸發 DOM 更新，Testing Library 的 auto-retry 只對元件內部 reactivity 有效
8. **`flushSync()` 不能在 effect 執行期間呼叫** — 只能在 state change 後、effect 外部使用
9. **Mock Svelte component** 的 default export 要包在 `{ default: ... }` 中
10. **優先用 `screen.getByRole` / `getByLabelText`** 等語意查詢，避免用 container querySelector（無 auto-retry 且容易因結構變動而壞掉）
