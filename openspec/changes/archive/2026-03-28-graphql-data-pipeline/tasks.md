## 1. GraphQL Search Migration

- [x] 1.1 Switch searchUsers from REST to GraphQL search query
- [x] 1.2 Add cursor-based pagination (replacing page-based)
- [x] 1.3 Fetch languages and topRepos in GraphQL query
- [x] 1.4 Use nodes pattern instead of edges
- [x] 1.5 Add rateLimit monitoring to query
- [x] 1.6 Filter null nodes (Organizations)
- [x] 1.7 Reduce first to 10 to avoid resource limits

## 2. Rate Limit Handling

- [x] 2.1 Add random 1-3s delay between pages
- [x] 2.2 Retry up to 3 times on secondary rate limit
- [x] 2.3 Auto-wait when primary rate limit low

## 3. Progress Reporting

- [x] 3.1 Accumulate onProgress count across pages
- [x] 3.2 TTY: real-time per-user progress
- [x] 3.3 CI: batch 10 usernames per line

## 4. CI Workflow

- [x] 4.1 Per-country commit instead of all-at-once
- [x] 4.2 Add country input for single-country collection
- [x] 4.3 Add limit input for testing
- [x] 4.4 Fix CJS top-level await (use node instead of tsx)
- [x] 4.5 Skip pre-commit hooks on data commits
- [x] 4.6 Pull rebase before push

## 5. Tests

- [x] 5.1 Add octokit-github-client integration tests with msw-fetch-mock
- [x] 5.2 Add pagination tests for searchUsersByLocation
- [x] 5.3 Add cursor pagination multi-page test
- [x] 5.4 Add null node filtering test
