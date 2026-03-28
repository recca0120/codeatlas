import { fetchMock } from "msw-fetch-mock";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { createOctokitClient } from "./octokit-github-client";

beforeAll(() => fetchMock.activate({ onUnhandledRequest: "error" }));
afterAll(() => fetchMock.deactivate());
afterEach(() => {
  fetchMock.assertNoPendingInterceptors();
  fetchMock.reset();
});

interface GraphQLUserNode {
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

function mockGraphqlSearch(
  nodes: (GraphQLUserNode | null)[],
  hasNextPage = false,
  endCursor: string | null = null,
  rateLimit = { cost: 6, remaining: 4994, resetAt: new Date().toISOString() },
) {
  fetchMock
    .get("https://api.github.com")
    .intercept({ path: "/graphql", method: "POST" })
    .reply(200, {
      data: {
        search: {
          userCount: nodes.filter(Boolean).length,
          nodes: nodes.map((n) => (n ? { __typename: "User", ...n } : null)),
          pageInfo: { hasNextPage, endCursor },
        },
        rateLimit,
      },
    });
}

function makeUserNode(
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

function mockRateLimit(remaining = 4999) {
  const resetTimestamp = Math.floor(Date.now() / 1000) + 3600;
  fetchMock
    .get("https://api.github.com")
    .intercept({ path: "/rate_limit", method: "GET" })
    .reply(200, {
      rate: { limit: 5000, remaining, reset: resetTimestamp, used: 1 },
      resources: {},
    });
}

describe("createOctokitClient", () => {
  describe("searchUsers", () => {
    it("maps GraphQL response to GitHubUser array", async () => {
      mockGraphqlSearch([
        makeUserNode({
          login: "alice",
          avatarUrl: "https://avatars.githubusercontent.com/alice",
          name: "Alice Chen",
          location: "Taipei",
          company: "Acme",
          bio: "Developer",
          twitterUsername: "alicetweets",
          websiteUrl: "https://alice.dev",
          followers: { totalCount: 100 },
          contributionsCollection: {
            contributionCalendar: { totalContributions: 500 },
            restrictedContributionsCount: 50,
          },
          repositories: {
            nodes: [
              {
                name: "repo-a",
                description: "First repo",
                stargazerCount: 200,
                primaryLanguage: { name: "TypeScript" },
              },
              {
                name: "repo-b",
                description: null,
                stargazerCount: 50,
                primaryLanguage: { name: "Go" },
              },
            ],
          },
        }),
      ]);

      const client = createOctokitClient("fake-token");
      const users = await client.searchUsers("location:Taiwan");

      expect(users).toHaveLength(1);
      expect(users[0]).toMatchObject({
        login: "alice",
        avatarUrl: "https://avatars.githubusercontent.com/alice",
        name: "Alice Chen",
        company: "Acme",
        location: "Taipei",
        bio: "Developer",
        followers: 100,
        publicContributions: 500,
        privateContributions: 50,
        twitterUsername: "alicetweets",
        blog: "https://alice.dev",
        languages: ["TypeScript", "Go"],
        topRepos: [
          {
            name: "repo-a",
            description: "First repo",
            stars: 200,
            language: "TypeScript",
          },
          { name: "repo-b", description: null, stars: 50, language: "Go" },
        ],
      });
    });

    it("calls onProgress for each user", async () => {
      mockGraphqlSearch([
        makeUserNode({ login: "alice" }),
        makeUserNode({ login: "bob" }),
      ]);

      const client = createOctokitClient("fake-token");
      const onProgress = vi.fn();
      await client.searchUsers("location:Taiwan", { onProgress });

      expect(onProgress).toHaveBeenCalledTimes(2);
      expect(onProgress).toHaveBeenCalledWith(1, 2, "alice");
      expect(onProgress).toHaveBeenCalledWith(2, 2, "bob");
    });

    it("returns empty array when no search results", async () => {
      mockGraphqlSearch([]);

      const client = createOctokitClient("fake-token");
      const users = await client.searchUsers("location:Nowhere");

      expect(users).toHaveLength(0);
    });

    it("handles null profile fields gracefully", async () => {
      mockGraphqlSearch([
        makeUserNode({
          login: "bob",
          name: null,
          company: null,
          location: null,
          bio: null,
          twitterUsername: null,
          websiteUrl: null,
          followers: { totalCount: 0 },
          contributionsCollection: {
            contributionCalendar: { totalContributions: 0 },
            restrictedContributionsCount: 0,
          },
        }),
      ]);

      const client = createOctokitClient("fake-token");
      const users = await client.searchUsers("location:Taiwan");

      expect(users[0]).toMatchObject({
        name: null,
        company: null,
        location: null,
        bio: null,
        followers: 0,
        twitterUsername: null,
        blog: null,
        publicContributions: 0,
        privateContributions: 0,
      });
    });

    it("handles missing contributionsCollection gracefully", async () => {
      mockGraphqlSearch([
        {
          login: "alice",
          avatarUrl: "https://a.com/alice",
          name: "Alice",
          location: "Taipei",
          followers: { totalCount: 10 },
          // no contributionsCollection
        },
      ]);

      const client = createOctokitClient("fake-token");
      const users = await client.searchUsers("location:Taiwan");

      expect(users[0].publicContributions).toBe(0);
      expect(users[0].privateContributions).toBe(0);
    });

    it("paginates with cursor and accumulates progress across pages", async () => {
      // Page 1: hasNextPage=true
      mockGraphqlSearch(
        [makeUserNode({ login: "alice" }), makeUserNode({ login: "bob" })],
        true,
        "cursor-abc",
      );
      // Page 2: hasNextPage=false
      mockGraphqlSearch([makeUserNode({ login: "charlie" })], false, null);

      const client = createOctokitClient("fake-token");
      const onProgress = vi.fn();
      const users = await client.searchUsers("location:Taiwan", { onProgress });

      expect(users).toHaveLength(3);
      expect(users.map((u) => u.login)).toEqual(["alice", "bob", "charlie"]);

      // Progress should accumulate across pages, not reset per page
      expect(onProgress).toHaveBeenCalledWith(1, expect.any(Number), "alice");
      expect(onProgress).toHaveBeenCalledWith(2, expect.any(Number), "bob");
      expect(onProgress).toHaveBeenCalledWith(3, expect.any(Number), "charlie");
    });

    it("filters out null nodes (Organizations in search results)", async () => {
      mockGraphqlSearch([
        makeUserNode({ login: "alice" }),
        null, // Organization that doesn't match User fragment
        makeUserNode({ login: "bob" }),
      ]);

      const client = createOctokitClient("fake-token");
      const users = await client.searchUsers("location:Taiwan");

      expect(users).toHaveLength(2);
      expect(users.map((u) => u.login)).toEqual(["alice", "bob"]);
    });
  });

  describe("getRateLimit", () => {
    it("returns remaining and resetAt", async () => {
      mockRateLimit(4999);

      const client = createOctokitClient("fake-token");
      const rateLimit = await client.getRateLimit();

      expect(rateLimit.remaining).toBe(4999);
      expect(rateLimit.resetAt).toBeInstanceOf(Date);
    });
  });
});
