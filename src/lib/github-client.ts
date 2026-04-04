import { z } from "zod";
import { shouldExcludeUser } from "./location-filter";

export const TopRepoSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  stars: z.number(),
  language: z.string().nullable(),
});
export type TopRepo = z.infer<typeof TopRepoSchema>;

export const GitHubUserSchema = z.object({
  login: z.string(),
  avatarUrl: z.string(),
  name: z.string().nullable(),
  company: z.string().nullable(),
  location: z.string().nullable(),
  bio: z.string().nullable(),
  followers: z.number(),
  publicContributions: z.number(),
  privateContributions: z.number(),
  languages: z.array(z.string()),
  topRepos: z.array(TopRepoSchema),
  twitterUsername: z.string().nullable(),
  blog: z.string().nullable(),
});
export type GitHubUser = z.infer<typeof GitHubUserSchema>;

export const RateLimitInfoSchema = z.object({
  remaining: z.number(),
  resetAt: z.date(),
});
export type RateLimitInfo = z.infer<typeof RateLimitInfoSchema>;

export type ProgressCallback = (current: number, login: string) => void;

export interface SearchOptions {
  onProgress?: ProgressCallback;
  limit?: number;
  pageSize?: number;
}

export interface GitHubClient {
  searchUsers(query: string, options?: SearchOptions): Promise<GitHubUser[]>;
  getRateLimit(): Promise<RateLimitInfo>;
}

export interface SearchByLocationOptions extends SearchOptions {
  countryCode?: string;
}

export function buildLocationQuery(locations: string[]): string {
  return locations
    .map((l) => (l.includes(" ") ? `location:"${l}"` : `location:${l}`))
    .join(" ");
}

export async function searchUsersByLocation(
  client: GitHubClient,
  locations: string[],
  options?: SearchByLocationOptions,
): Promise<GitHubUser[]> {
  const { countryCode, ...opts } = options ?? {};

  const query = buildLocationQuery(locations);
  const results = await client.searchUsers(query, opts);

  const seen = new Set<string>();
  const users: GitHubUser[] = [];

  for (const user of results) {
    if (seen.has(user.login)) continue;
    if (countryCode && shouldExcludeUser(countryCode, user.location)) continue;
    seen.add(user.login);
    users.push(user);
  }

  return users;
}
