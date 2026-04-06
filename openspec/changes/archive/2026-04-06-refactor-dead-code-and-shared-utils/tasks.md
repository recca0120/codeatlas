# Tasks: Refactor — Clean Up Dead Code and Extract Shared Utilities

## 1. Delete dead code

- [ ] 1.1 Remove `src/lib/emoji-flag.ts` and `src/lib/emoji-flag.test.ts`
- [ ] 1.2 Un-export `TopRepoSchema`, `TopRepo`, `RateLimitInfoSchema`, `ProgressCallback` from `github-client.ts`
- [ ] 1.3 Un-export `validateCountryConfig` and `CountryConfigSchema` from `country-config.ts`, update tests to use public API
- [ ] 1.4 Remove `export type Continent` from `country-list.ts`

## 2. Extract shared utilities

- [ ] 2.1 Extract `LANG_COLORS` to `src/lib/language-colors.ts`, update ProfilePage and RankingFilter imports
- [ ] 2.2 Extract `fmtNum` to `src/lib/format.ts`, update CountryPage and CountryList imports
- [ ] 2.3 Add `buildLocalePrefix(locale)` to `src/lib/locale-url.ts`, update all 4+ callsites
- [ ] 2.4 Rename `filterCountries` → `filterCountriesByQuery` in `country-list.ts`, update all imports and tests

## 3. Fix code smells

- [ ] 3.1 Fix `CountryList.svelte` hardcoded `zh-TW` → use `locale !== "en"` pattern
- [ ] 3.2 Reuse `groupByContinent` from lib in `CountryList.svelte` visibleByContinent instead of inline re-implementation
- [ ] 3.3 Extract shared `loadCountryConfig` from CountryPage/ProfilePage into `src/lib/data-loader.ts`
