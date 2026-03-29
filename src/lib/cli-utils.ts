import fs from "node:fs/promises";
import type { CountryConfig } from "./country-config";
import type { GitHubUser } from "./github-client";

const LANGS = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C++",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "Dart",
];
const COMPANIES = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "GitHub",
  "Vercel",
  "Stripe",
  null,
  null,
  null,
  null,
];
const DESCS = [
  "A modern CLI tool",
  "Web framework for developers",
  "Data pipeline library",
  "Open source utilities",
  "API wrapper",
  null,
];

function rand(a: number, b: number): number {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function pick<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

/**
 * Generate fake users for a country.
 */
export function generateFakeUsers(
  countryCode: string,
  countryName: string,
  locations: string[],
  count: number,
): GitHubUser[] {
  const users: GitHubUser[] = [];

  for (let i = 0; i < count; i++) {
    const decay = Math.exp(-i * 0.04);
    const login = `${countryCode.slice(0, 3)}-dev-${i + 1}`;
    const langs = pick(LANGS, rand(1, 4));
    const repos = Array.from({ length: rand(1, 3) }, (_, j) => ({
      name: `${login}-proj-${j + 1}`,
      description: DESCS[rand(0, DESCS.length - 1)],
      stars: Math.round(2000 * decay * Math.random() + rand(5, 50)),
      language: langs[j % langs.length],
    }));

    users.push({
      login,
      avatarUrl: `https://avatars.githubusercontent.com/u/${i + 1}?v=4`,
      name: `Dev ${i + 1} (${countryName})`,
      company: COMPANIES[rand(0, COMPANIES.length - 1)],
      location: locations[rand(0, locations.length - 1)],
      bio: i < 3 ? `Developer from ${countryName}` : null,
      followers: Math.round(5000 * decay + rand(10, 50)),
      publicContributions: Math.round(35000 * decay + rand(50, 200)),
      privateContributions: rand(0, 500),
      languages: langs,
      topRepos: repos,
      twitterUsername: i < 2 ? login : null,
      blog: i < 1 ? `https://${login}.dev` : null,
    });
  }

  return users;
}

/**
 * Build the output file path for a country's ranking data.
 */
export function buildOutputPath(countryCode: string): string {
  return `public/data/${countryCode}.json`;
}

/**
 * Get the country at the given checkpoint index (wraps around).
 */
export function getCheckpointCountry(
  countries: CountryConfig[],
  checkpoint: number,
): CountryConfig {
  return countries[checkpoint % countries.length];
}

/**
 * Reorder countries starting from checkpoint index, wrapping around.
 */
export function reorderFromCheckpoint(
  countries: CountryConfig[],
  checkpoint: number,
): CountryConfig[] {
  const start = checkpoint % countries.length;
  return [...countries.slice(start), ...countries.slice(0, start)];
}

/**
 * Compute the next checkpoint value (wraps around).
 */
export function nextCheckpoint(current: number, total: number): number {
  return (current + 1) % total;
}

/**
 * Load the checkpoint index from a JSON file. Returns 0 if file doesn't exist.
 */
export async function loadCheckpoint(filePath: string): Promise<number> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content).checkpoint ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Save the checkpoint index to a JSON file.
 */
export async function saveCheckpoint(
  filePath: string,
  value: number,
): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify({ checkpoint: value }));
}

/**
 * Filter countries by code. Returns all if no filter provided.
 */
export function filterCountries(
  countries: CountryConfig[],
  code: string | undefined,
): CountryConfig[] {
  if (!code) return countries;

  const found = countries.filter((c) => c.code === code);
  if (found.length === 0) {
    throw new Error(`Country not found: ${code}`);
  }
  return found;
}
