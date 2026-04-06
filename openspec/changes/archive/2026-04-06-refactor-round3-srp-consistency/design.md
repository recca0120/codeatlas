# Design: Refactor Round 3

## Decisions

### 1. toastZodError helper
Add `toastZodError(e: unknown)` to `toast.ts`. Checks `instanceof z.ZodError`, formats issues, calls `toast()`.

### 2. buildCountryUrl helper
Add to `locale-url.ts`: `buildCountryUrl(code, locale, basePath)` → `buildUrl(buildLocalePrefix(locale) + code + "/", basePath)`.

### 3. MAX_LANG_CHIPS constant
Define in `RankingFilter.svelte` as `const MAX_LANG_CHIPS = 12`.

### 4. initGlobe breakdown
Split into: `createGlobe()`, `setupResizeHandler()`, `setupPolygons()`. Keep in `HomePage.svelte` as local functions — no need for a separate file since they depend on component state.

### 5. Lifecycle consistency
Change CountryPage/ProfilePage from `$effect(() => loadData())` to `onMount(() => { loadData() })` to match HomePage pattern. These components don't need reactive re-fetching — props are set once.

### 6. ShareButtons copied logic
Move `copied = true; setTimeout(...)` after the try/catch block.

### 7. cli-utils LANGS
Import `LANG_COLORS` keys: `const LANGS = Object.keys(LANG_COLORS)`.

### 8. Move CountrySummarySchema to data-output.ts
Move schema + type from `country-list.ts` to `data-output.ts`. `country-list.ts` imports from `data-output.ts` (no more circular dep). Update all importers.
