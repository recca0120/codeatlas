## ADDED Requirements

### Requirement: Language switcher component
The system SHALL provide a `LocaleSwitcher.svelte` component that navigates the user to the equivalent page in the other locale.

#### Scenario: Switch from English to Chinese
- **WHEN** the user is on `/codeatlas/taiwan/` and clicks the locale switcher to select Chinese
- **THEN** the browser SHALL navigate to `/codeatlas/zh-TW/taiwan/` and localStorage SHALL save `locale="zh-TW"`

#### Scenario: Switch from Chinese to English
- **WHEN** the user is on `/codeatlas/zh-TW/taiwan/` and clicks the locale switcher to select English
- **THEN** the browser SHALL navigate to `/codeatlas/taiwan/` and localStorage SHALL save `locale="en"`

#### Scenario: Switcher displays current locale
- **WHEN** the locale switcher is rendered and the current locale is `"en"`
- **THEN** it SHALL visually indicate that English is the active language

### Requirement: Switcher placement in navigation
The `LocaleSwitcher` component SHALL be placed in the nav bar (`Layout.astro`), next to the theme toggle.

#### Scenario: Visible on all pages
- **WHEN** any page is rendered
- **THEN** the locale switcher SHALL be visible in the navigation bar

### Requirement: Locale preference redirect on visit
When a user visits the site root, the system SHALL check localStorage for a saved locale preference and redirect to the preferred locale if it differs from the current URL.

#### Scenario: Returning user with Chinese preference
- **WHEN** a user with localStorage `locale="zh-TW"` visits `/codeatlas/`
- **THEN** the system SHALL redirect to `/codeatlas/zh-TW/`

#### Scenario: New user with no preference
- **WHEN** a user with no localStorage locale visits `/codeatlas/`
- **THEN** the system SHALL stay on `/codeatlas/` (English default)
