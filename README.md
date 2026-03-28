[中文版](README.zh-TW.md)

# CodeAtlas

Global Developer Rankings — tracking developers across 130+ countries, ranked by GitHub contributions. Updated weekly.

**Live site:** https://recca0120.github.io/codeatlas/

## Features

- Country-level developer rankings (Public Contributions, Total Contributions, Followers)
- Interactive 3D globe visualization
- Per-developer profile pages with language breakdown and top repositories
- Internationalization (English / Traditional Chinese)
- Dark mode support
- Weekly automated data collection via GitHub Actions

## Tech Stack

- **Framework:** Astro 6 (Static Site Generation)
- **UI:** Svelte 5 (Islands Architecture)
- **Styling:** Tailwind CSS v4
- **3D:** Globe.gl + Three.js
- **Data:** GitHub REST & GraphQL APIs via Octokit
- **CI/CD:** GitHub Actions + GitHub Pages

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
| `GITHUB_TOKEN` | GitHub API token for data collection | — |

## Project Structure

```
src/
  i18n/          # Internationalization (locales, t() helper)
  components/    # Svelte 5 components (islands)
  layouts/       # Astro layouts
  lib/           # Shared utilities, API clients
  pages/         # Astro pages (en + zh-TW)
  styles/        # Global CSS
config/          # Country configurations
public/data/     # Generated ranking data (JSON)
scripts/         # CLI tools for data collection
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add countries, fix data, or contribute code.

## License

MIT
