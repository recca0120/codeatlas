# Proposal: Refactor Round 3 — SRP, Consistency, Remaining Duplication

## Why
Third code review round found duplicated error handling, URL construction, magic numbers, a massive 83-line function, inconsistent lifecycle patterns, and an architectural inversion causing circular dependency.

## What Changes
- Extract shared `toastZodError()` helper (3 duplicate callsites)
- Extract `buildCountryUrl()` helper (4 duplicate callsites)
- Name magic number for language chip limit
- Break up `initGlobe` into focused sub-functions
- Standardize data loading lifecycle (`$effect` vs `onMount`)
- Fix duplicated `copied` logic in ShareButtons
- Reuse `LANG_COLORS` keys in cli-utils fake data generator
- Move `CountrySummarySchema` from consumer to producer to fix circular dep

## Capabilities
### New Capabilities
_None — pure refactoring._
### Modified Capabilities
_None._

## Impact
Internal refactoring only. No UI or behavioral changes.
