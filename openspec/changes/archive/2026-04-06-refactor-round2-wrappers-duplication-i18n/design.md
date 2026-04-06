# Design: Refactor Round 2

## Context
Pure refactoring. No behavioral changes.

## Decisions

### 1. rebuildCountryData removal
Inline `CountryDataSchema.parse(raw)` at the single callsite in `cli.ts`. Delete the function.

### 2. validateCountryConfig removal  
Replace `data.map(validateCountryConfig)` with `data.map(d => CountryConfigSchema.parse(d))` in `loadAllCountryConfigs`. Update test to test through `loadAllCountryConfigs` or inline the schema parse.

### 3. LanguageBar LANG_COLORS
Import from `../lib/language-colors` instead of inline definition.

### 4. Shared path stripping
Extract `stripBasePath(path, basePath)` and `stripLocalePrefix(path)` into `locale-url.ts`. Use in both `router.ts` and `getOtherLocaleUrl`.

### 5. Link.svelte simplification
AppRouter already intercepts all `<a>` clicks globally. Link.svelte's click handler is redundant — but it also provides the `onclick` prop forwarding for GA tracking. Keep Link.svelte but remove the duplicate modifier-key guard and navigate call, since AppRouter handles it. Actually, AppRouter checks `e.defaultPrevented` first (line 41), so if Link prevents default, AppRouter skips. This means Link IS the primary handler and AppRouter is the fallback for plain `<a>` tags. They're not truly redundant — Link handles `<Link>` clicks, AppRouter handles raw `<a>` clicks. The modifier-key guard duplication is the real issue — extract to a shared helper.

### 6. i18n "top contributors"
Add `countryList.topContributors` key to both locale files.

## Risks
- Removing `validateCountryConfig` export may break tests → update tests in same step
- `rebuildCountryData` removal — verify no external callers first
