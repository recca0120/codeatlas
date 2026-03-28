## ADDED Requirements

### Requirement: Client-side navigation between all pages
All internal links SHALL use pushState navigation without full page reload. The URL SHALL update and the correct component SHALL render.

#### Scenario: Navigate from homepage to country page
- **WHEN** user clicks a country link on the homepage
- **THEN** URL changes to `/{country}/`, CountryPage renders, no page reload

#### Scenario: Navigate from country page to profile page
- **WHEN** user clicks a developer link on the country page
- **THEN** URL changes to `/{country}/{user}`, ProfilePage renders, no page reload

#### Scenario: Navigate back to homepage
- **WHEN** user clicks the home link in nav
- **THEN** URL changes to `/`, HomePage renders, no page reload

#### Scenario: Browser back/forward buttons
- **WHEN** user clicks browser back button after navigating
- **THEN** the previous page renders with correct URL

### Requirement: Link component for internal navigation
A reusable Link component SHALL intercept click events and use pushState instead of full navigation.

#### Scenario: Regular click navigates client-side
- **WHEN** user clicks a Link
- **THEN** pushState is called and AppRouter re-renders

#### Scenario: Ctrl+click opens new tab
- **WHEN** user ctrl+clicks or cmd+clicks a Link
- **THEN** default browser behavior opens a new tab (not intercepted)

### Requirement: Direct URL access still works via 404 fallback
Direct access to any route SHALL work via the existing 404.html redirect mechanism.

#### Scenario: Bookmark a country page
- **WHEN** user directly visits `/{country}/` via bookmark
- **THEN** 404.html redirects to SPA, correct page renders
