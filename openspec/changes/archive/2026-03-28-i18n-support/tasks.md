## 1. Core i18n Infrastructure (TDD)

- [x] 1.1 Define `Translations` type, `Locale` type, `SUPPORTED_LOCALES` constant, and `isValidLocale()` guard with tests
- [x] 1.2 Create `src/i18n/locales/en.ts` with all UI string keys
- [x] 1.3 Create `src/i18n/locales/zh-TW.ts` with Traditional Chinese translations
- [x] 1.4 Implement `t(key, locale?)` translation lookup function with tests
- [x] 1.5 Export barrel `src/i18n/index.ts`

## 2. Astro i18n Routing

- [x] 2.1 Add `i18n` config to `astro.config.mjs` (defaultLocale: "en", locales: ["en", "zh-TW"], prefixDefaultLocale: false)
- [x] 2.2 Add `PUBLIC_DEFAULT_LOCALE` to `.env.example` and Astro env config
- [x] 2.3 Update `404.html` to detect `/zh-TW/` prefix and redirect to correct locale's `/app/`
- [x] 2.4 Create `src/pages/zh-TW/index.astro` (thin wrapper passing locale)
- [x] 2.5 Create `src/pages/zh-TW/app.astro` (thin wrapper passing locale)
- [x] 2.6 Create `src/pages/zh-TW/faq.astro` (thin wrapper passing locale)

## 3. Locale Switcher Component

- [x] 3.1 Create `LocaleSwitcher.svelte` that builds URL for other locale and navigates
- [x] 3.2 Add `LocaleSwitcher` to `Layout.astro` nav bar next to theme toggle
- [x] 3.3 Add locale preference redirect script (check localStorage on site root, redirect if needed)

## 4. Replace Hardcoded Strings

- [x] 4.1 Add `locale` prop to `Layout.astro` (from `Astro.currentLocale`) and pass to components
- [x] 4.2 Replace strings in `Layout.astro` (nav links, site name)
- [x] 4.3 Replace strings in `index.astro` (hero text, section headers)
- [x] 4.4 Replace strings in `CountryPage.svelte` (table headers, labels)
- [x] 4.5 Replace strings in `ProfilePage.svelte` (stats labels, back link, section titles)
- [x] 4.6 Replace strings in `CountrySearch.svelte` (placeholder text)
- [x] 4.7 Replace strings in `RankingFilter.svelte` (filter labels)
- [x] 4.8 Replace strings in `AppRouter.svelte` (not found text, back link)
- [x] 4.9 Replace strings in `faq.astro` (FAQ content)
- [x] 4.10 Replace strings in `ShareButtons.svelte` (share labels)

## 5. Bilingual README

- [x] 5.1 Rewrite `README.md` as English project documentation with language toggle link at top
- [x] 5.2 Create `README.zh-TW.md` as Traditional Chinese project documentation with language toggle link at top
