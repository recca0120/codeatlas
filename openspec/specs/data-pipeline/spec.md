## ADDED Requirements

### Requirement: GraphQL search query fetches all user fields in one request
The system SHALL use a single GraphQL `search(type: USER)` query to fetch login, avatar, profile, followers, contributions, and top repositories.

#### Scenario: Single query returns complete user data
- **WHEN** `searchUsers("location:Taiwan")` is called
- **THEN** each returned user SHALL have login, avatarUrl, name, company, location, bio, followers, publicContributions, privateContributions, twitterUsername, blog, languages, and topRepos populated from a single GraphQL request

### Requirement: Cursor-based pagination
The system SHALL use GraphQL cursor pagination (`hasNextPage` + `endCursor`) to iterate through all search results.

#### Scenario: Multiple pages of results
- **WHEN** a search returns more than `first` users
- **THEN** the system SHALL automatically paginate using cursors until `hasNextPage` is false

### Requirement: Rate limit handling
The system SHALL add a random 1-3 second delay between pages and retry up to 3 times on secondary rate limit errors.

#### Scenario: Secondary rate limit hit
- **WHEN** GitHub returns a secondary rate limit error
- **THEN** the system SHALL retry after the `retry-after` delay, up to 3 times

#### Scenario: Primary rate limit low
- **WHEN** `rateLimit.remaining` drops below 100
- **THEN** the system SHALL wait until `rateLimit.resetAt` before continuing

### Requirement: Null node filtering
The system SHALL filter out null nodes from search results (Organizations that don't match the User fragment).

#### Scenario: Mixed User and Organization results
- **WHEN** search results contain null nodes (Organizations)
- **THEN** only User nodes SHALL be included in the output

### Requirement: Progress callback with cumulative count
The system SHALL call `onProgress(current, knownTotal, login)` with cumulative counts across all pages.

#### Scenario: Progress across multiple pages
- **WHEN** page 1 has 10 users and page 2 has 5 users
- **THEN** onProgress SHALL be called with current values 1-10 for page 1 and 11-15 for page 2

### Requirement: Per-country CI commits
The CI workflow SHALL collect and commit data for each country individually, so partial results are available immediately.

#### Scenario: Country collected successfully
- **WHEN** a country's data is collected
- **THEN** it SHALL be committed immediately with `--no-verify` and message `data: update {code} {date} [skip ci]`

#### Scenario: Country collection fails
- **WHEN** a country's data collection fails
- **THEN** it SHALL be skipped and the next country SHALL be processed

### Requirement: CI workflow inputs
The CI workflow SHALL support `country` (single country code) and `limit` (max users) inputs for targeted testing.

#### Scenario: Single country with limit
- **WHEN** workflow is triggered with `country=taiwan` and `limit=20`
- **THEN** only Taiwan SHALL be collected with at most 20 users

### Requirement: CI progress output
The CLI SHALL batch 10 usernames per log line in CI (non-TTY), and show real-time per-user progress in TTY.

#### Scenario: CI output format
- **WHEN** running in CI (non-TTY)
- **THEN** output SHALL show `[count] name1, name2, ..., name10` every 10 users
