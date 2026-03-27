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

export interface GitHubClient {
  searchUsers(query: string, page: number): Promise<GitHubUser[]>;
  getRateLimit(): Promise<RateLimitInfo>;
}

export async function searchUsersByLocation(
  client: GitHubClient,
  locations: string[],
  countryCode?: string,
): Promise<GitHubUser[]> {
  // Lazy import to avoid circular deps
  const { shouldExcludeUser } = await import("./location-filter");

  const seen = new Set<string>();
  const users: GitHubUser[] = [];

  for (const location of locations) {
    const query = `location:${location}`;
    const results = await client.searchUsers(query, 1);

    for (const user of results) {
      if (seen.has(user.login)) continue;
      if (countryCode && shouldExcludeUser(countryCode, user.location))
        continue;
      seen.add(user.login);
      users.push(user);
    }
  }

  return users;
}
