---
name: commander
description: Commander.js v14 CLI 框架最佳實踐。當需要建立 CLI 工具、解析命令列參數、設計 subcommands 時使用。
---

# Commander.js v14

## 基本設定

```ts
import { Command } from "commander";

const program = new Command()
  .name("my-cli")
  .description("CLI description")
  .version("1.0.0");
```

## Options

```ts
program
  .option("-d, --debug", "debug mode")           // boolean
  .option("-p, --port <number>", "port", parseInt) // required value + parser
  .option("-c, --config [path]", "config file")   // optional value
  .requiredOption("-u, --user <name>", "user");    // mandatory
```

## Subcommands

```ts
program
  .command("serve")
  .description("start server")
  .argument("[root]", "project root", ".")
  .option("-p, --port <number>", "port", parseInt)
  .action(async (root, options) => {
    console.log(`Serving ${root} on ${options.port}`);
  });

await program.parseAsync();
```

## 共用 Options

```ts
function addSharedOptions(cmd: Command) {
  return cmd
    .option("-c, --country <code>", "country code")
    .option("-l, --limit <number>", "limit", parseInt);
}

addSharedOptions(program.command("collect")).action(async (opts) => { ... });
addSharedOptions(program.command("generate")).action(async (opts) => { ... });
```

## Async Action

用 `parseAsync()` 取代 `parse()`：

```ts
program.command("fetch").action(async () => {
  await fetchData();
});

await program.parseAsync();
```

## 錯誤處理

```ts
import { InvalidArgumentError } from "commander";

function myParseInt(value: string): number {
  const n = parseInt(value, 10);
  if (isNaN(n)) throw new InvalidArgumentError("Not a number");
  return n;
}
```

## Hooks

```ts
program
  .hook("preAction", (_, cmd) => console.log(`Running: ${cmd.name()}`))
  .hook("postAction", (_, cmd) => console.log(`Done: ${cmd.name()}`));
```

## TypeScript 強型別

安裝 `@commander-js/extra-typings` 可自動推導 `opts()` 型別。

## 常用模式

| 模式 | 做法 |
|------|------|
| 顯示 help on error | `program.showHelpAfterError()` |
| Exit override | `program.exitOverride()` + try/catch |
| Choices | `new Option("--size <s>").choices(["s","m","l"])` |
| Env fallback | `new Option("--port <n>").env("PORT")` |
