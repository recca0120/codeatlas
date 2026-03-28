## Why

CodeAtlas currently has all UI strings hardcoded in English. To reach a broader audience (especially in Taiwan/Asia), we need internationalization (i18n) with Chinese (zh-TW) and English (en) support. We also need bilingual README files and the ability to configure the default language via `.env`.

## What Changes

- Add an i18n system with translation files for `en` and `zh-TW`
- Replace all hardcoded UI strings across pages and components with translation keys
- Add locale-aware routing or locale switching mechanism
- Create `README.md` (English, default) and `README.zh-TW.md` (Traditional Chinese)
- Support `PUBLIC_DEFAULT_LOCALE` env variable in `.env` to set the default language
- Add a language switcher component in the nav bar

## Capabilities

### New Capabilities
- `i18n`: Core internationalization system — translation file structure, locale resolution (from env, URL, or browser), and a `t()` helper function for looking up translated strings
- `locale-switcher`: UI component for switching between languages, persisted to localStorage

### Modified Capabilities

_(none — no existing specs are changing at the requirement level)_

## Impact

- **Code**: All components with user-facing text (`Layout.astro`, `CountrySearch.svelte`, `CountryPage.svelte`, `ProfilePage.svelte`, `RankingFilter.svelte`, `ShareButtons.svelte`, `AppRouter.svelte`, `index.astro`, `faq.astro`)
- **Config**: New `PUBLIC_DEFAULT_LOCALE` env variable in Astro config
- **Docs**: New `README.zh-TW.md`, updated `README.md` with language badge/link
- **Dependencies**: None expected (plain JSON/TS translation files, no external i18n library)
