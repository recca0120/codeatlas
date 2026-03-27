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

### vitest-setup.ts
```ts
import "@testing-library/jest-dom/vitest";
```

### 測試範例
```ts
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import Counter from "./Counter.svelte";

test("increments on click", async () => {
  const user = userEvent.setup();
  render(Counter);
  await user.click(screen.getByRole("button"));
  expect(screen.getByRole("button")).toHaveTextContent("1");
});
```

### 重要注意事項

1. **使用 runes 的檔案必須含 `.svelte`**（如 `.svelte.ts`、`.svelte.test.ts`）
2. **用 `svelteTesting()` plugin** — 自動處理 browser resolve + cleanup
3. **低階 `mount()` 測試需要 `flushSync()`**
4. **解構會斷開 reactivity** — 用 getter 或直接存取
5. **Snippets 不能從測試傳入** — 建立 wrapper component
