## Context

Currently two test files test GitHub data fetching:
- `octokit-github-client.test.ts` — uses `msw-fetch-mock` to mock GraphQL API, tests `createOctokitClient`
- `github-client.test.ts` — uses hand-written `createFakeClient` (mock of `GitHubClient` interface), tests `searchUsersByLocation`

The fake client diverges from real behavior (e.g. didn't respect limit until manually patched).

## Goals / Non-Goals

**Goals:**
- All tests use `msw-fetch-mock` + real `createOctokitClient`
- `searchUsersByLocation` tested through real HTTP stack
- Shared mock helpers between test files to avoid duplication
- TDD approach: rewrite tests first (Red), verify they pass with real client (Green)

**Non-Goals:**
- Changing production code
- Adding new test cases (only rewriting existing ones)

## Decisions

### 1. Extract shared GraphQL mock helpers

**Decision**: Create shared helpers (`mockGraphqlSearch`, `makeUserNode`) that both test files can use. Put them in a shared location or just inline in each file.

**Why**: `octokit-github-client.test.ts` already has good helpers. Reuse the same pattern in `github-client.test.ts`.

### 2. Tests call searchUsersByLocation with real createOctokitClient

**Decision**: Each test creates a real client via `createOctokitClient("fake-token")` and passes it to `searchUsersByLocation`. HTTP is intercepted by `msw-fetch-mock`.

**Why**: This tests the full stack — searchUsersByLocation → createOctokitClient → GraphQL API (mocked). No interface-level fakes.

### 3. Keep octokit-github-client.test.ts unchanged

**Decision**: Only rewrite `github-client.test.ts`. The other file already uses `msw-fetch-mock` correctly.

**Why**: Minimize change scope. Only fix the inconsistency.

## Risks / Trade-offs

- **[Trade-off]** Tests become slower (~1s per test due to octokit throttle plugin timeouts) — acceptable for integration-level confidence
- **[Risk]** Shared mock helpers may need to handle pagination for multi-page tests — manageable complexity
