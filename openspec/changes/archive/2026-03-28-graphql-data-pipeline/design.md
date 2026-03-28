## Context

CodeAtlas collects GitHub developer data for 134 countries via GitHub Actions weekly cron. Previously used REST Search API + per-user REST/GraphQL calls. Migrated to single GraphQL search query following gayanvoice/top-github-users patterns.

## Goals / Non-Goals

**Goals:**
- Single GraphQL query per page with all user fields
- Cursor-based pagination through all results
- Rate limit aware (primary + secondary)
- Per-country CI commits for incremental progress
- Progress reporting in CLI and CI

**Non-Goals:**
- Breaking the 1000 result cap (follower-range splitting — future work)
- Caching/minimum-threshold protection (gayanvoice's 750 minimum — future work)

## Decisions

### 1. GraphQL Search API with `nodes` pattern
Single query fetches: login, avatar, profile fields, followers, contributions, top 5 repositories. Uses `nodes` (not `edges`) for simplicity.

### 2. `first: 10` per page
GitHub Actions `GITHUB_TOKEN` has lower rate limits (1000 pts/hr). `first: 100` with `repositories(first: 5)` exceeded resource limits. `first: 10` matches gayanvoice's approach.

### 3. Random delay 1-3s between pages
Prevents secondary rate limit (2000 pts/min). Octokit throttle plugin retries up to 3 times on secondary limit.

### 4. Per-country commits in CI
Each country is collected and committed individually with `--no-verify` (skip lefthook). Failed countries are skipped without blocking others.

## Risks / Trade-offs

- **[Trade-off]** `first: 10` means 100 pages for 1000 users with 1-3s delay = ~3-5 min per country
- **[Risk]** 1000 result cap not addressed yet → large countries may miss users
