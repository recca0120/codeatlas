const en = {
  // Nav
  "nav.home": "CodeAtlas",
  "nav.faq": "FAQ",

  // Hero
  "hero.title": "Global Developer Rankings",
  "hero.description":
    "Tracking developers across {count} countries, ranked by GitHub contributions. Updated weekly.",
  "hero.countries": "{count} Countries",

  // Continents
  "continent.asia": "Asia",
  "continent.europe": "Europe",
  "continent.americas": "Americas",
  "continent.africa": "Africa",
  "continent.oceania": "Oceania",

  // Globe
  "globe.clickToExplore": "Click to explore",

  // Search
  "search.placeholder": "Search countries...",

  // Country page
  "country.loading": "Loading...",
  "country.notFound": "Country not found",
  "country.loadError": 'Could not load data for "{code}"',
  "country.backToHome": "← Back to CodeAtlas",
  "country.developers": "developers",
  "country.contributions": "contributions",
  "country.updated": "Updated",
  "country.share": "Share {name} rankings",
  "country.topDevelopers": "Top GitHub developers in {name}",
  "country.ogDescription":
    "Top {count} GitHub developers in {country}, ranked by contributions and followers.",

  // Ranking filter
  "ranking.public": "Public",
  "ranking.total": "Total",
  "ranking.followers": "Followers",
  "ranking.searchDeveloper": "Search developer...",
  "ranking.allCities": "All cities",
  "ranking.noResults": "No results",
  "ranking.clearFilters": "Clear filters",
  "ranking.clearAll": "Clear all",
  "ranking.of": "of",
  "ranking.developers": "developers",

  // Profile page
  "profile.loading": "Loading...",
  "profile.notFound": "Not found",
  "profile.userNotFound": 'User "{name}" not found in {country}',
  "profile.loadError": 'Could not load data for "{name}"',
  "profile.backTo": "← Back to {name}",
  "profile.contributions": "Contributions",
  "profile.followers": "Followers",
  "profile.github": "GitHub",
  "profile.blog": "Blog",
  "profile.languages": "Languages",
  "profile.topRepos": "Top Repositories",
  "profile.viewOnGithub": "View full profile on GitHub",
  "profile.shareProfile": "Share profile",
  "profile.shareText": "{name} is #{rank} in {country} on CodeAtlas!",
  "profile.ogDescription":
    "{name} is ranked #{rank} among GitHub developers in {country}.",

  // Theme
  "theme.switchToLight": "Switch to light theme",
  "theme.switchToDark": "Switch to dark theme",

  // Share
  "share.copied": "COPIED ✓",
  "share.copyLink": "COPY LINK",

  // Heatmap
  "heatmap.label": "Contribution activity heatmap",
  "heatmap.less": "Less",
  "heatmap.more": "More",
  "heatmap.contributions": "contributions",

  // App router
  "app.pageNotFound": "Page not found",
  "app.backToHome": "← Back to CodeAtlas",

  // Footer
  "footer.text": "CodeAtlas · Data from GitHub API · Updated weekly · ",

  // FAQ page
  "faq.title": "FAQ — CodeAtlas",
  "faq.backHome": "← HOME",
  "faq.heading": "Frequently Asked Questions",
  "faq.backToCodeAtlas": "← BACK TO CODEATLAS",

  "faq.q1": "How do I get listed?",
  "faq.a1":
    'CodeAtlas automatically indexes GitHub users based on their profile location. To be included, make sure your GitHub profile has a <strong>location</strong> set to a recognized city or country (e.g., "Taipei, Taiwan" or "Taiwan"). You also need at least some public activity (contributions or followers).',

  "faq.q2": "How are rankings calculated?",
  "faq.a2.intro": "We offer three ranking dimensions:",
  "faq.a2.public":
    "<strong>Public Contributions</strong> — commits, PRs, issues, and reviews on public repositories (from GitHub's contribution calendar)",
  "faq.a2.total":
    "<strong>Total Contributions</strong> — public + private contributions (private count from GraphQL <code>restrictedContributionsCount</code>)",
  "faq.a2.followers": "<strong>Followers</strong> — GitHub follower count",

  "faq.q3": "How often is data updated?",
  "faq.a3":
    'Rankings are updated <strong>weekly</strong> via GitHub Actions. The "<strong>Last updated</strong>" timestamp on each country page shows the most recent data refresh.',

  "faq.q4": "Why am I not listed?",
  "faq.a4.intro": "Common reasons:",
  "faq.a4.r1":
    "Your GitHub profile location is empty or doesn't match a recognized city/country",
  "faq.a4.r2":
    "Your location uses an emoji flag instead of text (we're working on supporting this)",
  "faq.a4.r3": "You have very few public contributions or followers",
  "faq.a4.r4":
    "The data hasn't been refreshed yet — check back after the weekly update",

  "faq.q5": "My data is wrong. How do I fix it?",
  "faq.a5":
    'Rankings are pulled directly from the GitHub API. If your contribution count looks wrong, check your <strong>GitHub profile settings</strong> and ensure "<strong>Private contributions</strong>" is enabled if you want those counted. Data will update on the next weekly refresh.',

  "faq.q6": "How do I add a new country or city?",
  "faq.a6":
    "CodeAtlas uses a simple JSON config system. To add a country or city, submit a PR adding a file to <code>config/countries/</code>. See <strong>CONTRIBUTING.md</strong> for details.",

  "faq.q7": "What is the data source?",
  "faq.a7":
    'All data comes from the <a href="https://docs.github.com/en/rest" target="_blank" rel="noopener" class="text-accent hover:underline">GitHub REST API</a> and <a href="https://docs.github.com/en/graphql" target="_blank" rel="noopener" class="text-accent hover:underline">GitHub GraphQL API</a>. We use the Search API to find users by location, then fetch their contribution data via GraphQL.',

  // Locale switcher
  "locale.en": "English",
  "locale.zh-TW": "中文",
} as const;

export default en;
