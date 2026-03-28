---
name: zod
description: Zod v4 schema validation 最佳實踐指南。當需要定義 schema、驗證/解析 JSON 資料、type inference、或處理 unknown data 時使用。
---

# Zod v4 Guide (v4.3+)

## 安裝

```bash
npm install zod    # v4 is latest
```

需要 TypeScript 5.5+ 且 `"strict": true`。

## Import

```ts
import { z } from "zod";
```

## Primitives

```ts
z.string()    z.number()    z.boolean()
z.null()      z.undefined() z.unknown()
z.int()       z.int32()     z.float64()
```

## Objects

```ts
// 預設 strip unknown keys
const User = z.object({
  name: z.string(),
  age: z.number(),
});

// 嚴格模式：拒絕 unknown keys
const StrictUser = z.strictObject({ name: z.string() });

// 寬鬆模式：保留 unknown keys
const LooseUser = z.looseObject({ name: z.string() });
```

### Object 操作

```ts
User.extend({ email: z.email() });
// 效能更好的寫法：
z.object({ ...User.shape, email: z.email() });

User.pick({ name: true });
User.omit({ age: true });
User.partial();
User.required();
User.keyof();
```

## Arrays

```ts
z.array(z.string())
z.array(z.string()).min(1).max(10)
```

## Enums

```ts
const Color = z.enum(["red", "green", "blue"]);

// TypeScript enums（v4 新增，取代 z.nativeEnum）
enum Direction { Up, Down }
z.enum(Direction);
```

## Optional / Nullable / Default

```ts
z.string().optional()     // string | undefined
z.string().nullable()     // string | null
z.string().nullish()      // string | null | undefined
z.string().default("hi")  // 預設值
z.number().catch(0)       // parse 失敗時的 fallback
```

## parse vs safeParse

```ts
// 失敗時拋出 ZodError
const data = schema.parse(input);

// 不拋錯，回傳 discriminated union
const result = schema.safeParse(input);
if (result.success) {
  result.data;   // typed
} else {
  result.error;  // ZodError
}
```

## Type Inference

```ts
type User = z.infer<typeof User>;         // output type
type UserInput = z.input<typeof User>;    // input type（transforms 前）
```

**最佳實踐**：從 schema 推導 type（`z.infer`），不要另外定義 interface — single source of truth。

## String Formats（v4 新增 top-level）

```ts
z.email()    z.url()     z.uuid()
z.iso.date() z.iso.datetime()
// 舊寫法 z.string().email() 已 deprecated
```

## Transforms & Pipes

```ts
z.string().transform(val => val.length)  // string → number
z.coerce.number()                         // String(input) → number
```

## Refinements

```ts
z.string().refine(val => val.length <= 255, { error: "Too long" });

// 跨欄位驗證
z.object({
  password: z.string(),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  error: "Passwords don't match",
  path: ["confirm"],
});
```

## Recursive Schemas（v4 用 getter，不需要 z.lazy）

```ts
const Category = z.object({
  name: z.string(),
  get children() { return z.array(Category); },
});
```

## Branded Types

```ts
const UserId = z.string().brand<"UserId">();
type UserId = z.infer<typeof UserId>;
```

## Error 自訂（v4 改用 error 參數）

```ts
// v3: message / invalid_type_error / required_error（已移除）
// v4:
z.string({ error: "Must be string" });
z.string({ error: (issue) =>
  issue.input === undefined ? "Required" : "Invalid"
});
```

## JSON Schema 轉換（v4 新增）

```ts
const jsonSchema = z.toJSONSchema(schema);
```

## 最佳實踐

1. **Single source of truth**：schema 定義一次，type 用 `z.infer` 推導
2. **解析 unknown JSON**：用 `.safeParse()` 處理不信任的外部資料
3. **Unknown keys**：預設 `z.object()` 會 strip — 適合清理舊格式資料
4. **Union 效能**：大量 union 用 `z.discriminatedUnion()`（O(1) lookup）
5. **Composition**：用 spread `{ ...Base.shape }` 優於 `.extend()` chain
6. **Nullable fields**：`.nullable()` 對應 `null`，`.optional()` 對應 `undefined`
