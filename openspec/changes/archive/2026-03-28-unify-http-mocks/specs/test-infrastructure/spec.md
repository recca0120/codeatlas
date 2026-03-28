## ADDED Requirements

### Requirement: All HTTP tests use msw-fetch-mock
All test files that test GitHub API interaction SHALL use `msw-fetch-mock` for HTTP mocking, not hand-written interface mocks.

#### Scenario: searchUsersByLocation tests use real client
- **WHEN** `searchUsersByLocation` tests run
- **THEN** they SHALL use `createOctokitClient("fake-token")` with `msw-fetch-mock` intercepting HTTP

### Requirement: No hand-written GitHubClient fakes
Test files SHALL NOT create manual implementations of `GitHubClient` interface for testing. All tests SHALL go through the real `createOctokitClient` implementation.

#### Scenario: No createFakeClient in test files
- **WHEN** test files are inspected
- **THEN** there SHALL be no `createFakeClient` or manual `GitHubClient` mock implementations

### Requirement: Shared mock helpers
GraphQL mock helpers (mockGraphqlSearch, makeUserNode) SHALL be reusable across test files.

#### Scenario: Both test files use same mock pattern
- **WHEN** `github-client.test.ts` and `octokit-github-client.test.ts` mock GraphQL
- **THEN** they SHALL use the same `msw-fetch-mock` intercept pattern
