[中文版](DEVELOPMENT.zh-TW.md)

# Development Guide

## Getting Started

```bash
pnpm install
pnpm dev          # Start dev server at localhost:4321
pnpm build        # Build for production
pnpm preview      # Preview production build
```

## Data Collection

Rankings are collected weekly via GitHub Actions. To run locally:

```bash
# Generate sample/fake data for development
pnpm tsx scripts/cli.ts generate

# Collect real data (requires GITHUB_TOKEN)
GITHUB_TOKEN=ghp_xxx pnpm tsx scripts/cli.ts collect
```

## Configuration

| Variable | Description | Default |
|---|---|---|
| `PUBLIC_DEFAULT_LOCALE` | Default language (`en` or `zh-TW`) | `en` |
| `PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 Measurement ID | — |
| `GITHUB_TOKEN` | GitHub API token for data collection | — |

## Tech Stack

- **Framework:** Astro 6 (Static Site Generation)
- **UI:** Svelte 5 (Islands Architecture)
- **Styling:** Tailwind CSS v4
- **3D:** Globe.gl + Three.js
- **Data:** GitHub REST & GraphQL APIs via Octokit
- **Validation:** Zod (runtime schema validation)
- **CI/CD:** GitHub Actions + GitHub Pages

## Project Structure

```
src/
  i18n/          # Internationalization (locales, t() helper)
  components/    # Svelte 5 components (islands)
  layouts/       # Astro layouts
  lib/           # Shared utilities, API clients, Zod schemas
  pages/         # Astro pages (en + zh-TW)
  styles/        # Global CSS
config/          # Country configurations
public/data/     # Generated ranking data (JSON)
scripts/         # CLI tools for data collection
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add countries, fix data, or contribute code.
