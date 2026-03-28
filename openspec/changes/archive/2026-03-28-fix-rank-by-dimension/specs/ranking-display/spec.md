## ADDED Requirements

### Requirement: Rank numbers reflect selected dimension
RankingFilter SHALL display rank numbers corresponding to the currently selected dimension tab. When the user switches between public_contributions, total_contributions, and followers tabs, the rank number for each developer SHALL reflect their position in that dimension's ranking.

#### Scenario: Switch to followers tab
- **WHEN** user clicks the "Followers" tab
- **THEN** rank numbers reflect the followers-based ranking order

#### Scenario: Switch to total contributions tab
- **WHEN** user clicks the "Total Contributions" tab
- **THEN** rank numbers reflect the total contributions-based ranking order

#### Scenario: Default tab shows public contributions ranking
- **WHEN** the component loads with default settings
- **THEN** rank numbers reflect the public contributions-based ranking order
