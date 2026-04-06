# Design: Refactor — Clean Up Dead Code and Extract Shared Utilities

## Context

Pure refactoring change. No new features or behavioral changes. All existing tests must continue passing with equivalent expectations.

## Goals / Non-Goals

**Goals:**
- Remove dead code to reduce maintenance surface
- Extract duplicated logic into shared modules
- Fix naming collisions and inconsistent patterns

**Non-Goals:**
- No UI or behavioral changes
- No new features
- Not refactoring the globe integration (HomePage `initGlobe`) — separate concern

## Decisions

### 1. Shared utilities location
Place extracted utilities in `src/lib/`:
- `language-colors.ts` — `LANG_COLORS` constant
- `format.ts` — `fmtNum()` formatter
- `locale-url.ts` — add `buildLocalePrefix()` to existing file

**Rationale:** Follow existing project convention of `src/lib/` for shared logic.

### 2. Rename strategy for `filterCountries` collision
Rename `filterCountries` in `country-list.ts` → `filterCountriesByQuery`. Keep `cli-utils.ts` version unchanged (it's the CLI-specific filter by code).

**Rationale:** `country-list.ts` is the newer file; `cli-utils.ts` has more established usage in scripts.

### 3. Shared data loading helper
Extract `loadCountryConfig(countryCode, basePath)` returning `{ countryName, countryFlag, countryData }`. Place in `src/lib/data-loader.ts`.

**Rationale:** CountryPage and ProfilePage duplicate this exact pattern. A shared helper reduces both files by ~15 lines each.

### 4. Un-export vs delete for `validateCountryConfig`
Keep the function, remove `export`. Tests that directly import it should use `loadAllCountryConfigs` instead (the public API).

**Rationale:** The function is used internally by `loadAllCountryConfigs`. Only the test imports it directly.

## Risks / Trade-offs

- [Risk] Renaming `filterCountriesByQuery` breaks imports → Mitigation: grep all usages, update in same step
- [Risk] Un-exporting `CountryConfigSchema` breaks tests → Mitigation: update tests to test through public API

## Open Questions

_None._
