# Tasks: Refactor Round 2

## 1. Remove one-line wrappers

- [ ] 1.1 Inline `rebuildCountryData` — replace callsite in cli.ts with `CountryDataSchema.parse(raw)`, delete function
- [ ] 1.2 Inline `validateCountryConfig` — replace with direct schema parse in `loadAllCountryConfigs`, update tests

## 2. Fix duplication

- [ ] 2.1 LanguageBar.svelte — import `LANG_COLORS` from shared lib instead of inline copy
- [ ] 2.2 Extract `stripBasePath` and `stripLocalePrefix` into `locale-url.ts`, use in `router.ts` and `getOtherLocaleUrl`
- [ ] 2.3 Extract modifier-key guard into shared `isModifiedClick(e)` helper, use in Link.svelte and AppRouter.svelte

## 3. i18n

- [ ] 3.1 Add `countryList.topContributors` i18n key, use in CountryList.svelte
