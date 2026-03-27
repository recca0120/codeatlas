---
name: vitest
description: Vitest 4.x 測試框架最佳實踐指南。當需要設定測試、撰寫單元/元件測試、mocking、coverage、整合 Astro/Three.js 測試時使用。
---

# Vitest Best Practices Guide (4.x)

## 版本資訊

- 最新穩定版：**Vitest 4.1.2**（2026-03）
- Vitest 4.0 新增：Browser Mode 穩定化、`toMatchScreenshot()`、`expect.schemaMatching`、`expect.assert`

## 安裝

```bash
npm install -D vitest @vitest/coverage-v8
```

## 設定（vitest.config.ts）

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e'],
    restoreMocks: true, // 自動還原 mock
    pool: 'forks',      // 預設，最安全

    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/**/*.test.ts'],
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
});
```

## Astro 整合

```ts
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: { /* vitest options */ },
});
```

### 測試 Astro 元件（Container API，Astro 4.9+）

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Card from '../src/components/Card.astro';

test('Card renders', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Card, {
    slots: { default: 'content' },
  });
  expect(html).toContain('content');
});
```

## Mocking

### vi.fn() — 獨立 mock function

```ts
const handler = vi.fn();
handler('arg');
expect(handler).toHaveBeenCalledWith('arg');
```

### vi.spyOn() — 觀察既有方法

```ts
const spy = vi.spyOn(console, 'log');
doSomething();
expect(spy).toHaveBeenCalledWith('expected');
```

### vi.mock() — 替換整個模組（會被 hoisted）

```ts
vi.mock('./api', () => ({
  fetchData: vi.fn().mockResolvedValue({ id: 1 }),
}));
```

### 清理層級

| 方法 | 效果 |
|------|------|
| `mockClear()` | 清除呼叫記錄 |
| `mockReset()` | 清除 + 移除實作 |
| `mockRestore()` | 還原原始（僅 spy） |

**建議**：設定 `restoreMocks: true` 自動還原。

## 測試 Async / Timers / Fetch

### Async

```ts
it('fetches data', async () => {
  const data = await fetchUser(1);
  expect(data.name).toBe('Alice');
});
```

### Fake Timers

```ts
it('debounce', () => {
  vi.useFakeTimers();
  const fn = vi.fn();
  debounce(fn, 300)();
  vi.advanceTimersByTime(300);
  expect(fn).toHaveBeenCalledOnce();
  vi.useRealTimers();
});
```

### Mock fetch

```ts
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ data: 'test' }),
}));
```

## 測試 Three.js / WebGL 程式

WebGL 在 Node.js 不可用，策略：

### Mock Renderer

```ts
vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>();
  return {
    ...actual,
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      setSize: vi.fn(),
      render: vi.fn(),
      domElement: document.createElement('canvas'),
      dispose: vi.fn(),
      setPixelRatio: vi.fn(),
    })),
  };
});
```

**原則**：將場景邏輯（物件位置、層級、材質）與渲染分開測試。Mock `WebGLRenderer`，專注測試 scene graph。

## 測試 Node.js 腳本（如 data collection）

```ts
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn().mockResolvedValue('content'),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve([{ id: 1 }]),
}));

import { collectData } from './collect';

it('collects data', async () => {
  const result = await collectData();
  expect(result).toHaveLength(1);
});
```

## Workspace / Projects

```ts
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: { name: 'unit', include: ['src/**/*.unit.test.ts'], environment: 'node' },
      },
      {
        extends: true,
        test: { name: 'components', include: ['src/**/*.component.test.ts'], environment: 'jsdom' },
      },
    ],
  },
});
```

執行特定 project：`vitest --project unit`

## Coverage：v8 vs Istanbul

| | v8（預設） | Istanbul |
|---|---|---|
| 速度 | 較快 | 較慢 |
| 安裝 | `@vitest/coverage-v8` | `@vitest/coverage-istanbul` |
| 適用 | V8 runtime（Node.js） | 所有 JS runtime |

**建議用 v8**。忽略特定行：`/* v8 ignore next */`

## DOM 測試環境

- **happy-dom**：較快，大多數情況適用
- **jsdom**：DOM 實作更完整

```ts
// 單檔覆蓋
// @vitest-environment happy-dom
```

## Snapshot Testing

```ts
expect(result).toMatchSnapshot();           // 檔案 snapshot
expect(result).toMatchInlineSnapshot();     // inline（自動填入）
expect(html).toMatchFileSnapshot('./expected.html'); // 自訂檔案
```

更新：`vitest -u`

## In-Source Testing

```ts
export function add(a: number, b: number) { return a + b; }

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('adds', () => expect(add(1, 2)).toBe(3));
}
```

設定：`includeSource: ['src/**/*.ts']`
Production 移除：`define: { 'import.meta.vitest': 'undefined' }`

## 效能優化

| 策略 | 做法 |
|------|------|
| Pool | `threads`（大專案）、`forks`（預設，安全） |
| 停用隔離 | `isolate: false`（無副作用時） |
| 限縮搜尋 | `dir: 'src'` |
| CI 分片 | `--shard=1/4` + `--merge-reports` |

## 常見陷阱

1. **vi.mock() 被 hoisted** — 不能用下方宣告的變數
2. **fetch + threads pool** — 會 "Failed to terminate worker"，改用 `forks`
3. **Native modules + threads** — segfault，改用 `forks`
4. **path alias 找不到** — 安裝 `vite-tsconfig-paths`
5. **忘記 await async** — 用 `expect().rejects` 處理預期錯誤

## Type Testing

檔名：`*.test-d.ts`，執行：`vitest --typecheck`

```ts
import { expectTypeOf } from 'vitest';
expectTypeOf(add).parameter(0).toBeNumber();
expectTypeOf(add(1, 2)).toEqualTypeOf<number>();
```
