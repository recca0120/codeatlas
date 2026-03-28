export interface TopRepo {
  name: string;
  description: string | null;
  stars: number;
  language: string | null;
}

export interface GitHubUser {
  login: string;
  avatarUrl: string;
  name: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
  followers: number;
  publicContributions: number;
  privateContributions: number;
  languages: string[];
  topRepos: TopRepo[];
  twitterUsername: string | null;
  blog: string | null;
}

export interface RateLimitInfo {
  remaining: number;
  resetAt: Date;
}

export type ProgressCallback = (
  current: number,
  total: number,
  login: string,
) => void;

export interface SearchOptions {
  onProgress?: ProgressCallback;
  limit?: number;
}

export interface GitHubClient {
  searchUsers(
    query: string,
    options?: SearchOptions,
  ): Promise<GitHubUser[]>;
  getRateLimit(): Promise<RateLimitInfo>;
}

export async function searchUsersByLocation(
  client: GitHubClient,
  locations: string[],
  countryCode?: string,
  onProgress?: ProgressCallback,
  limit?: number,
): Promise<GitHubUser[]> {
  const { shouldExcludeUser } = await import("./location-filter");

  const query = locations.map((l) => `location:${l}`).join(" ");
  const results = await client.searchUsers(query, { onProgress, limit });

  const seen = new Set<string>();
  const users: GitHubUser[] = [];

  for (const user of results) {
    if (seen.has(user.login)) continue;
    if (countryCode && shouldExcludeUser(countryCode, user.location)) continue;
    seen.add(user.login);
    users.push(user);
    if (limit && users.length >= limit) break;
  }

  return users;
}
