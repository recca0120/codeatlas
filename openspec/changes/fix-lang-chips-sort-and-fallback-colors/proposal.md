# Proposal: Fix Language Chips — Sort by Frequency + Fallback Colors

## Why
Language chips on ranking pages display in unstable order (repo appearance order) and languages not in LANG_COLORS have nearly invisible fallback styling (#555 at 15% opacity).

## What Changes
- Sort user languages by global frequency at display time (RankingFilter, ProfilePage)
- Improve fallback color for unlisted languages to be visible in both themes
- Add more languages to LANG_COLORS to cover common ones (Jupyter Notebook, Shell, CSS, Vim Script, etc.)

## Capabilities
### New Capabilities
_None — display logic improvement._
### Modified Capabilities
_None._

## Impact
Visual only. No data or API changes. Existing test expectations remain equivalent.
