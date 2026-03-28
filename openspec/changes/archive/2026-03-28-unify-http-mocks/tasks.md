## 1. Extract shared mock helpers

- [x] 1.1 Create `src/lib/test-helpers/github-mocks.ts` with shared `mockGraphqlSearch`, `makeUserNode`, `mockRateLimit` helpers
- [x] 1.2 Migrate `octokit-github-client.test.ts` to import from shared helpers
- [x] 1.3 Verify all existing octokit tests still pass

## 2. Rewrite github-client.test.ts

- [x] 2.1 Remove `createFakeClient` and replace with `createOctokitClient` + `msw-fetch-mock`
- [x] 2.2 Rewrite "deduplicates users from results" test
- [x] 2.3 Rewrite "returns empty for no users" test
- [x] 2.4 Rewrite "filters out excluded users by location" test
- [x] 2.5 Rewrite "passes onProgress callback" test
- [x] 2.6 Rewrite "respects limit option" test
- [x] 2.7 Remove GitHubClient interface unit tests (tested implicitly through real client)
