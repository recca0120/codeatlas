import { fetchMock } from "msw-fetch-mock";

export interface GraphQLUserNode {
  login: string;
  avatarUrl?: string;
  name?: string | null;
  location?: string | null;
  company?: string | null;
  bio?: string | null;
  twitterUsername?: string | null;
  websiteUrl?: string | null;
  followers?: { totalCount: number };
  contributionsCollection?: {
    contributionCalendar: { totalContributions: number };
    restrictedContributionsCount: number;
  };
  repositories?: {
    nodes: Array<{
      name: string;
      description: string | null;
      stargazerCount: number;
      primaryLanguage: { name: string } | null;
    }>;
  };
}

export function mockGraphqlSearch(
  nodes: (GraphQLUserNode | null)[],
  hasNextPage = false,
  endCursor: string | null = null,
  rateLimit = {
    cost: 6,
    remaining: 4994,
    resetAt: new Date().toISOString(),
  },
) {
  fetchMock
    .get("https://api.github.com")
    .intercept({ path: "/graphql", method: "POST" })
    .reply(200, {
      data: {
        search: {
          userCount: nodes.filter(Boolean).length,
          nodes: nodes.map((n) =>
            n ? { __typename: "User", ...n } : null,
          ),
          pageInfo: { hasNextPage, endCursor },
        },
        rateLimit,
      },
    });
}

export function makeUserNode(
  overrides: Partial<GraphQLUserNode> = {},
): GraphQLUserNode {
  const login = overrides.login ?? "alice";
  return {
    login,
    avatarUrl: `https://avatars.githubusercontent.com/${login}`,
    name: `${login} Name`,
    location: "Taipei, Taiwan",
    company: null,
    bio: null,
    twitterUsername: null,
    websiteUrl: null,
    followers: { totalCount: 42 },
    contributionsCollection: {
      contributionCalendar: { totalContributions: 100 },
      restrictedContributionsCount: 10,
    },
    repositories: {
      nodes: [
        {
          name: "awesome-project",
          description: "A cool project",
          stargazerCount: 50,
          primaryLanguage: { name: "TypeScript" },
        },
      ],
    },
    ...overrides,
  };
}

export function mockRateLimit(remaining = 4999) {
  const resetTimestamp = Math.floor(Date.now() / 1000) + 3600;
  fetchMock
    .get("https://api.github.com")
    .intercept({ path: "/rate_limit", method: "GET" })
    .reply(200, {
      rate: {
        limit: 5000,
        remaining,
        reset: resetTimestamp,
        used: 1,
      },
      resources: {},
    });
}
