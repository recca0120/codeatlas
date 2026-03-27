import type { GitHubUser } from "./github-client";

export function createMockUser(
  overrides: Partial<GitHubUser> = {},
): GitHubUser {
  return {
    login: "test-user",
    avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
    name: null,
    company: null,
    location: null,
    bio: null,
    followers: 0,
    publicContributions: 0,
    privateContributions: 0,
    languages: [],
    topRepos: [],
    twitterUsername: null,
    blog: null,
    ...overrides,
  };
}
