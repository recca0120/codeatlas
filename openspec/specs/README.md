# CodeAtlas — Specification

## What

GitHub developer ranking website. 134 countries, 1000 developers per country, ranked by contributions. Dark/light theme. 3D globe on homepage.

## Tech Stack

- **Astro 6** — Static site generator
- **Svelte 5** — Interactive components (search, filter, pagination)
- **Tailwind CSS v4** — Styling (zinc palette, dark/light via @custom-variant)
- **Three.js + globe.gl** — 3D globe on homepage
- **Vitest** — Testing (62 tests)
- **Biome** — Linting + formatting
- **GitHub Actions** — Data collection (weekly cron) + deployment (GitHub Pages)

## Pages

### Homepage (`/`)
- Split layout: left text + stats, right globe (desktop only)
- Country search (Svelte)
- Countries grouped by continent (flag + name)

### Ranking Page (`/{country}/`)
- Country header: flag, name, developer count, contribution total, updated date
- Svelte RankingFilter: search, language filter (multi-select chips), city filter, dimension tabs (Public/Total/Followers), pagination (50/page), URL query params
- Ranking rows: rank, avatar, name, location, language pills, contribution number
- Top 3 visually larger (font size + avatar size)
- Share buttons (6 platforms + copy link)

### Profile Page (`/{country}/{user}`)
- Avatar, name, handle, location, company, bio
- Social links (GitHub, Twitter, blog)
- Stats: rank, contributions, followers
- Language distribution bar
- Top repositories
- GitHub profile link
- Share buttons

### FAQ (`/faq`)
- How to get listed, ranking methodology, update frequency, data source

## Data Model

```typescript
interface GitHubUser {
  login, avatarUrl, name, company, location, bio,
  followers, publicContributions, privateContributions,
  languages: string[],
  topRepos: { name, description, stars, language }[],
  twitterUsername, blog
}
```

Rankings: `public_contributions`, `total_contributions`, `followers`

## Data Collection

- GitHub REST API (search users by location) + GraphQL (contributions, repos)
- Octokit with throttling + retry plugins
- Location disambiguation (Georgia state vs country, Granada)
- Emoji flag detection in location field
- Weekly cron via GitHub Actions
- Output: `data/{country}.json` + `config/countries/{country}.json`

## Design

- Style: Linear minimalism + Editorial typography
- Colors: Tailwind zinc palette (dark: #09090b, light: #fafafa)
- Accent: indigo-500
- Fonts: Space Grotesk (headings), Inter (body), JetBrains Mono (data)
- Globe: transparent background, indigo heatmap coloring
- Dark/Light theme toggle with localStorage + system preference
