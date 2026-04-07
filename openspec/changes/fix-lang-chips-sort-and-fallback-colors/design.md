# Design: Language Chips Sort + Fallback Colors

## Decisions

### 1. Sort function location
Add `sortByFrequency(userLangs: string[], allLangs: string[]): string[]` to `src/lib/ranking.ts`. Takes a user's languages and the global frequency-sorted list, returns the user's languages reordered by their position in the global list.

### 2. Integration points
- `RankingFilter.svelte` — already has `allLangs` (frequency-sorted). Use it to sort each `user.languages.slice(0, 3)`.
- `ProfilePage.svelte` — doesn't have global frequency data. Sort alphabetically as fallback, or pass ranking data. Simpler: just sort alphabetically since profile page shows all languages, not a ranked subset.

### 3. Fallback colors
Expand `LANG_COLORS` in `language-colors.ts` to cover 20+ common languages. For truly unknown languages, use a neutral but visible fallback: `#6b7280` (gray-500) instead of `#555`.

### 4. Fallback styling
Change fallback from `{color}25` opacity to a solid light background with readable text. Update the inline style pattern.
