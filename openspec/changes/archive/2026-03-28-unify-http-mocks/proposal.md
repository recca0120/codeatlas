## Why

`github-client.test.ts` uses a hand-written fake client (mock of `GitHubClient` interface) while `octokit-github-client.test.ts` uses `msw-fetch-mock` for HTTP-level mocking. This inconsistency means `searchUsersByLocation` is never tested against real HTTP behavior — the fake client silently diverges from the real implementation (e.g. it didn't implement limit until manually fixed). Unifying all HTTP tests on `msw-fetch-mock` ensures tests exercise the full stack through the real `createOctokitClient`.

## What Changes

- Remove hand-written `createFakeClient` from `github-client.test.ts`
- Rewrite `searchUsersByLocation` tests to use `msw-fetch-mock` + real `createOctokitClient`
- All HTTP-touching tests use `msw-fetch-mock` consistently
- `github-client.ts` only exports types and the `searchUsersByLocation` function (no mock helpers needed)

## Capabilities

### New Capabilities

_(none — this is a test infrastructure refactor)_

### Modified Capabilities

_(none — no production behavior changes)_

## Impact

- **Tests**: `github-client.test.ts` rewritten to use `msw-fetch-mock`
- **Code**: No production code changes
- **Risk**: Low — only test code changes, production code untouched
