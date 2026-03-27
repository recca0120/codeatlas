# Contributing to CodeAtlas

## Adding a New Country or City

CodeAtlas uses a simple JSON config system. To add a new country or expand city coverage:

1. Create a file in `config/countries/{country-code}.json`:

```json
{
  "code": "your-country",
  "name": "Your Country",
  "flag": "🏳️",
  "locations": ["Your Country", "Capital City", "Other City"]
}
```

2. Add the ISO country code mapping in `src/lib/globe/country-mapping.ts`

3. Submit a PR

The data will be automatically collected on the next weekly cron run.

## How Data Collection Works

1. **GitHub Actions** runs weekly (`collect-data.yml`)
2. For each country config, it searches GitHub users by location keywords
3. User data is fetched via GitHub REST API + GraphQL (for contributions)
4. Results are saved as `data/{country-code}.json` and committed back
5. The website rebuilds and deploys to GitHub Pages

## Development

```bash
npm install
npm run dev        # Start dev server
npm run test       # Run tests
npm run typecheck  # TypeScript check
npm run lint       # Biome lint
npm run check      # All checks
```

## Tech Stack

- **Astro 6** — Static site generator
- **Svelte 5** — Interactive components (islands)
- **Tailwind CSS v4** — Styling
- **Three.js + globe.gl** — 3D globe on homepage
- **Vitest** — Testing
- **Biome** — Linting + formatting
- **GitHub Actions** — CI/CD + data collection
