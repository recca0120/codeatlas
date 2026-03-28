## Why

The data collection pipeline used REST Search API + per-user REST profile + per-user GraphQL contributions (3 API calls per user), making it slow and rate-limit prone. Following gayanvoice/top-github-users patterns, switching to a single GraphQL search query with cursor pagination dramatically reduces API calls and enables collecting up to 1000 users per country.

## What Changes

- Switch from REST 3-call pattern to single GraphQL search query with all fields (profile, contributions, repositories)
- Add cursor-based pagination (replacing page-based)
- Add per-page delay (1-3s) and secondary rate limit retry to avoid GitHub throttling
- Collect languages and topRepos in the same query (previously empty arrays)
- CI workflow: per-country commit (instead of all-at-once), country input parameter, progress output
- CI workflow: fix CJS top-level await, skip pre-commit hooks on data commits

## Capabilities

### New Capabilities
- `data-pipeline`: GraphQL-based data collection with cursor pagination, rate limit handling, and progress reporting

### Modified Capabilities

_(none)_

## Impact

- **Code**: `octokit-github-client.ts`, `github-client.ts`, `scripts/cli.ts`
- **CI**: `.github/workflows/collect-data.yml`
- **Tests**: `octokit-github-client.test.ts`, `github-client.test.ts` (msw-fetch-mock integration tests)
- **API calls**: Reduced from 3N to ~N/10 per country (N users)
