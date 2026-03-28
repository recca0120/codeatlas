## ADDED Requirements

### Requirement: Astro i18n routing configuration
The system SHALL configure Astro's built-in i18n in `astro.config.mjs` with `defaultLocale: "en"`, `locales: ["en", "zh-TW"]`, and `prefixDefaultLocale: false`.

#### Scenario: English routes have no prefix
- **WHEN** a user visits `/codeatlas/taiwan/`
- **THEN** the page SHALL render in English

#### Scenario: Chinese routes use zh-TW prefix
- **WHEN** a user visits `/codeatlas/zh-TW/taiwan/`
- **THEN** the page SHALL render in Traditional Chinese

### Requirement: Translation file structure
The system SHALL store translations as TypeScript objects in `src/i18n/locales/{locale}.ts`, each exporting a flat key-value record typed with `satisfies` against a shared `Translations` type.

#### Scenario: English locale file exists
- **WHEN** the project is built
- **THEN** `src/i18n/locales/en.ts` SHALL exist and export all required translation keys

#### Scenario: Chinese locale file exists
- **WHEN** the project is built
- **THEN** `src/i18n/locales/zh-TW.ts` SHALL exist and export all required translation keys with identical keys to `en.ts`

#### Scenario: Type safety for missing keys
- **WHEN** a locale file is missing a key that exists in the `Translations` type
- **THEN** TypeScript compilation SHALL fail

### Requirement: Translation lookup function
The system SHALL provide a `t(key, locale?)` function that returns the translated string for the given key and locale.

#### Scenario: Lookup existing key in English
- **WHEN** `t("nav.home", "en")` is called
- **THEN** it SHALL return the English translation for `nav.home`

#### Scenario: Lookup existing key in Chinese
- **WHEN** `t("nav.home", "zh-TW")` is called
- **THEN** it SHALL return the Traditional Chinese translation for `nav.home`

#### Scenario: Missing key fallback
- **WHEN** `t("nonexistent.key", "en")` is called
- **THEN** it SHALL return the key string `"nonexistent.key"` as fallback

#### Scenario: Default locale used when locale omitted
- **WHEN** `t("nav.home")` is called without a locale argument
- **THEN** it SHALL use `"en"` as the default locale

### Requirement: Supported locales and type
The system SHALL define a `SUPPORTED_LOCALES` array of `["en", "zh-TW"]`, a `Locale` type union, and an `isValidLocale()` type guard.

#### Scenario: Valid locale check
- **WHEN** `isValidLocale("zh-TW")` is called
- **THEN** it SHALL return `true`

#### Scenario: Invalid locale check
- **WHEN** `isValidLocale("fr")` is called
- **THEN** it SHALL return `false`

### Requirement: Locale-aware SPA fallback
The `404.html` SHALL detect locale prefixes in the URL path and redirect to the corresponding locale's `/app/` page.

#### Scenario: Chinese URL fallback
- **WHEN** a user visits `/codeatlas/zh-TW/taiwan/` and no static page exists
- **THEN** `404.html` SHALL redirect to `/codeatlas/zh-TW/app/?route=/taiwan/`

#### Scenario: English URL fallback unchanged
- **WHEN** a user visits `/codeatlas/taiwan/` and no static page exists
- **THEN** `404.html` SHALL redirect to `/codeatlas/app/?route=/taiwan/` (same as current behavior)

### Requirement: Locale pages for zh-TW
The system SHALL create `src/pages/zh-TW/index.astro`, `src/pages/zh-TW/app.astro`, and `src/pages/zh-TW/faq.astro` that render the same components as their English counterparts but with `locale="zh-TW"`.

#### Scenario: Chinese index page builds
- **WHEN** `astro build` runs
- **THEN** `/codeatlas/zh-TW/index.html` SHALL be generated

#### Scenario: Chinese app page builds
- **WHEN** `astro build` runs
- **THEN** `/codeatlas/zh-TW/app/index.html` SHALL be generated

### Requirement: UI strings replaced with translation keys
All hardcoded user-facing strings in pages and components SHALL be replaced with `t()` calls, receiving locale from `Astro.currentLocale` (in `.astro`) or from a prop (in `.svelte`).

#### Scenario: Navigation shows translated text
- **WHEN** the locale is `"zh-TW"`
- **THEN** the FAQ link SHALL display the Chinese translation

#### Scenario: Country page shows translated labels
- **WHEN** the locale is `"zh-TW"` and a country page is viewed
- **THEN** labels like "Contributions", "Followers" SHALL display in Chinese

### Requirement: Environment variable for default locale
The system SHALL support `PUBLIC_DEFAULT_LOCALE` env variable to set the default locale. The language switcher SHALL save preference to localStorage and redirect to the preferred locale on next visit.

#### Scenario: Env sets default to Chinese
- **WHEN** `PUBLIC_DEFAULT_LOCALE=zh-TW` is set and a user visits `/codeatlas/` for the first time
- **THEN** the system MAY redirect to `/codeatlas/zh-TW/`

#### Scenario: localStorage overrides env
- **WHEN** localStorage has `locale="en"` and env has `PUBLIC_DEFAULT_LOCALE=zh-TW`
- **THEN** the user SHALL stay on the English version

### Requirement: Bilingual README
The project SHALL have `README.md` (English, default) and `README.zh-TW.md` (Traditional Chinese) as project documentation. Each SHALL include a language toggle link at the top.

#### Scenario: English README has Chinese link
- **WHEN** a user views `README.md`
- **THEN** the top of the file SHALL contain a link to `README.zh-TW.md`

#### Scenario: Chinese README has English link
- **WHEN** a user views `README.zh-TW.md`
- **THEN** the top of the file SHALL contain a link to `README.md`
