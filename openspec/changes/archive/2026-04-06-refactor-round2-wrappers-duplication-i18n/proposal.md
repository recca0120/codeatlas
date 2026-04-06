# Proposal: Refactor Round 2 — Remove Wrappers, Fix Duplication, i18n

## Why
Second round of code review found remaining one-line passthrough wrappers, duplicated logic between router/locale-url and Link/AppRouter, a duplicated LANG_COLORS in LanguageBar, and an untranslated string.

## What Changes
- Inline `rebuildCountryData` (one-line passthrough, zero external callers)
- Inline `validateCountryConfig` (one-line passthrough, used only internally)
- Fix `LanguageBar.svelte` to import shared `LANG_COLORS` instead of inline copy
- Extract shared `stripBasePath` helper to deduplicate router.ts / locale-url.ts
- Remove `Link.svelte` redundancy — AppRouter already handles global click delegation
- Add i18n key for "top contributors" in CountryList.svelte

## Capabilities
### New Capabilities
_None — pure refactoring._
### Modified Capabilities
_None._

## Impact
Internal refactoring only. No UI or behavioral changes. All test expectations remain equivalent.
