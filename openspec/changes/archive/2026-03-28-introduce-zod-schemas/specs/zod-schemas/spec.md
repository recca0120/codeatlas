## ADDED Requirements

### Requirement: Zod schemas as single source of truth for data types
TypeScript types for TopRepo, GitHubUser, and CountryData SHALL be derived from Zod schemas using z.infer, not manually defined interfaces.

#### Scenario: Type inference from schema
- **WHEN** a consumer imports `GitHubUser` type
- **THEN** it is equivalent to `z.infer<typeof GitHubUserSchema>`

### Requirement: rebuildCountryData uses schema parse
rebuildCountryData SHALL accept `unknown` input and use Zod schema `.parse()` to validate and strip unknown keys.

#### Scenario: Strip legacy rankings field
- **WHEN** rebuildCountryData receives JSON with a `rankings` field
- **THEN** the output does not contain `rankings` (stripped by z.object default behavior)

#### Scenario: Parse valid data
- **WHEN** rebuildCountryData receives valid CountryData JSON
- **THEN** it returns a typed CountryData object with all fields preserved
