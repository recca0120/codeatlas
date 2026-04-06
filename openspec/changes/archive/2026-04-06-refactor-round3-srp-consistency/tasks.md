# Tasks: Refactor Round 3

## 1. Extract shared helpers

- [ ] 1.1 Add `toastZodError(e)` to `toast.ts`, replace 3 callsites (CountryPage, ProfilePage, HomePage)
- [ ] 1.2 Add `buildCountryUrl(code, locale, basePath)` to `locale-url.ts`, replace 4+ callsites
- [ ] 1.3 cli-utils: use `Object.keys(LANG_COLORS)` instead of hardcoded LANGS array

## 2. Fix code smells

- [ ] 2.1 RankingFilter: name magic number `MAX_LANG_CHIPS = 12`
- [ ] 2.2 ShareButtons: deduplicate `copied` logic — move after try/catch
- [ ] 2.3 Standardize lifecycle: CountryPage/ProfilePage `$effect` → `onMount`

## 3. Architecture

- [ ] 3.1 Move `CountrySummarySchema`/`CountrySummary` from `country-list.ts` to `data-output.ts`, update all imports
- [ ] 3.2 Break up `initGlobe` in HomePage into sub-functions, convert `.then` chains to async/await
