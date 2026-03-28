## Context

CodeAtlas is an Astro 6 static site with Svelte 5 islands, deployed to GitHub Pages at `/codeatlas/`. All UI text is hardcoded English. Dynamic country/profile pages use a SPA fallback pattern: `404.html` → `/app/?route=`.

## Goals / Non-Goals

**Goals:**
- Provide `en` and `zh-TW` translations via TypeScript objects
- Use Astro built-in i18n routing with `prefixDefaultLocale: false` (English has no prefix, Chinese uses `/zh-TW/`)
- Default locale configurable via `PUBLIC_DEFAULT_LOCALE` env variable
- Language switcher in nav, persisted to localStorage
- Bilingual README (project documentation)
- TDD approach

**Non-Goals:**
- RTL language support
- Translating dynamic data (country names, user profiles)
- More than 2 locales for now

## Decisions

### 1. Astro built-in i18n routing

**Decision**: Use `astro.config.mjs` `i18n` config with `defaultLocale: "en"`, `locales: ["en", "zh-TW"]`, `prefixDefaultLocale: false`.

**Why**: Native Astro support, URL-based locales are shareable and SEO friendly. English stays at `/codeatlas/taiwan/` (no change), Chinese at `/codeatlas/zh-TW/taiwan/`.

**Alternative considered**: Client-side only switching — simpler but no SEO benefit, URLs not shareable per-locale.

### 2. SPA fallback adaption for i18n

**Decision**: Update `404.html` to detect `/zh-TW/` prefix and redirect to the correct locale's `/app/` page.

**Why**: The SPA fallback is how dynamic routes (country, profile pages) work. It just needs locale awareness:
- `/codeatlas/zh-TW/taiwan/` → `/codeatlas/zh-TW/app/?route=/taiwan/`
- `/codeatlas/taiwan/` → `/codeatlas/app/?route=/taiwan/` (unchanged)

### 3. Static page structure for i18n

**Decision**: Create `src/pages/zh-TW/` directory mirroring the default pages (`index.astro`, `app.astro`, `faq.astro`). Each locale page imports the same components but passes locale as prop.

**Why**: Astro i18n expects page files in locale directories. Keeping components shared means minimal duplication — only the page wrappers are duplicated.

### 4. Translation file format: TypeScript objects

**Decision**: Use `src/i18n/locales/en.ts` and `src/i18n/locales/zh-TW.ts` exporting typed translation records.

**Why**: Type safety with `satisfies` ensures all keys exist in every locale at compile time. No runtime parsing. IDE autocomplete. No external dependency.

### 5. `t()` function with locale parameter

**Decision**: `t(key, locale)` looks up the key in the specified locale's translations. In `.astro` files, locale comes from `Astro.currentLocale`. In Svelte islands, locale is passed as a prop and also available via a reactive signal for runtime switching.

**Why**: `Astro.currentLocale` is the idiomatic way to get locale in Astro pages. Svelte islands need the prop for initial render plus a signal for the language switcher.

### 6. Locale resolution order

**Decision**: For static pages: `Astro.currentLocale` (from URL). For client-side: localStorage `"locale"` → `PUBLIC_DEFAULT_LOCALE` env → `"en"`.

**Why**: URL determines the locale at build/render time. Client-side localStorage allows the switcher to persist preference and redirect to the correct locale URL.

### 7. Language switcher behavior

**Decision**: The switcher navigates to the equivalent page in the other locale (e.g., `/codeatlas/taiwan/` ↔ `/codeatlas/zh-TW/taiwan/`) using Astro's `getRelativeLocaleUrl()` pattern. It also saves preference to localStorage.

**Why**: URL-based routing means switching locale = navigating to a new URL. localStorage remembers the preference for next visit.

### 8. README strategy

**Decision**: `README.md` is English (default). `README.zh-TW.md` is Traditional Chinese. Each has a language toggle badge at the top.

**Why**: English README is standard for GitHub discoverability. Badge pattern is widely used.

## Risks / Trade-offs

- **[Risk] Page duplication for locale dirs** → Mitigation: Locale pages are thin wrappers (~3 lines) importing shared components. All logic stays in components.
- **[Risk] 404.html locale detection edge cases** → Mitigation: Simple string check for known locale prefixes. Only `zh-TW` for now.
- **[Trade-off] Navigation on locale switch** → Full page navigation instead of instant client-side switch. Acceptable for static site with fast loads.
