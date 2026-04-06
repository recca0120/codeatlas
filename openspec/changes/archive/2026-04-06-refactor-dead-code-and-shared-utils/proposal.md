# Proposal: Refactor — Clean Up Dead Code and Extract Shared Utilities

## Why

Code review identified dead code, duplicated logic across 4+ components, naming collisions, and inconsistent patterns. This increases maintenance burden and makes the codebase harder to navigate.

## What Changes

- Remove dead files: `emoji-flag.ts`, unused exports in `github-client.ts`, `country-config.ts`, `country-list.ts`
- Extract duplicated `LANG_COLORS` into shared `language-colors.ts`
- Extract duplicated `fmtNum` into shared `format.ts`
- Extract locale prefix helper into `locale-url.ts`
- Rename `filterCountries` in `country-list.ts` to `filterCountriesByQuery` to avoid naming collision with `cli-utils.ts`
- Fix hardcoded `zh-TW` locale checks → use `locale !== "en"` pattern
- Reuse `groupByContinent` in `CountryList.svelte` instead of inline re-implementation
- Extract shared `loadCountryConfig` from duplicated logic in CountryPage/ProfilePage

## Capabilities

### New Capabilities
_None — this is a pure refactoring change._

### Modified Capabilities
_None — no behavioral changes, only internal structure._

## Impact

- All changes are internal refactoring — no API, UI, or behavioral changes
- Existing test expectations must remain equivalent (TDD refactoring)
- Affected files: ~15 files across `src/lib/` and `src/components/`
