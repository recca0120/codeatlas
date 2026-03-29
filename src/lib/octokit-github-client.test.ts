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
import {
  makeUserNode,
  mockGraphqlSearch,
  mockRateLimit,
} from "./test-helpers/github-mocks";

beforeAll(() => fetchMock.activate({ onUnhandledRequest: "error" }));
afterAll(() => fetchMock.deactivate());
afterEach(() => {
  fetchMock.assertNoPendingInterceptors();
  fetchMock.reset();
});

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
        publicContributions: 450,
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
      expect(onProgress).toHaveBeenCalledWith(1, "alice");
      expect(onProgress).toHaveBeenCalledWith(2, "bob");
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
        },
      ]);

      const client = createOctokitClient("fake-token");
      const users = await client.searchUsers("location:Taiwan");

      expect(users[0].publicContributions).toBe(0);
      expect(users[0].privateContributions).toBe(0);
    });

    it("paginates with cursor and accumulates progress across pages", async () => {
      mockGraphqlSearch(
        [makeUserNode({ login: "alice" }), makeUserNode({ login: "bob" })],
        true,
        "cursor-abc",
      );
      mockGraphqlSearch([makeUserNode({ login: "charlie" })], false, null);

      const client = createOctokitClient("fake-token");
      const onProgress = vi.fn();
      const users = await client.searchUsers("location:Taiwan", { onProgress });

      expect(users).toHaveLength(3);
      expect(users.map((u) => u.login)).toEqual(["alice", "bob", "charlie"]);
      expect(onProgress).toHaveBeenCalledWith(1, "alice");
      expect(onProgress).toHaveBeenCalledWith(2, "bob");
      expect(onProgress).toHaveBeenCalledWith(3, "charlie");
    });

    it("filters out null nodes (Organizations in search results)", async () => {
      mockGraphqlSearch([
        makeUserNode({ login: "alice" }),
        null,
        makeUserNode({ login: "bob" }),
      ]);

      const client = createOctokitClient("fake-token");
      const users = await client.searchUsers("location:Taiwan");

      expect(users).toHaveLength(2);
      expect(users.map((u) => u.login)).toEqual(["alice", "bob"]);
    });

    it("uses default pageSize of 20", async () => {
      mockGraphqlSearch([]);

      const client = createOctokitClient("fake-token");
      await client.searchUsers("location:Taiwan");

      const call = fetchMock.calls.lastCall({ path: "/graphql" });
      const body = call?.json() as { variables: { first: number } };
      expect(body.variables.first).toBe(20);
    });

    it("uses custom pageSize when provided", async () => {
      mockGraphqlSearch([]);

      const client = createOctokitClient("fake-token");
      await client.searchUsers("location:Taiwan", { pageSize: 15 });

      const call = fetchMock.calls.lastCall({ path: "/graphql" });
      const body = call?.json() as { variables: { first: number } };
      expect(body.variables.first).toBe(15);
    });

    it("stops fetching when limit is reached", async () => {
      mockGraphqlSearch([
        makeUserNode({ login: "alice" }),
        makeUserNode({ login: "bob" }),
        makeUserNode({ login: "charlie" }),
      ]);

      const client = createOctokitClient("fake-token");
      const users = await client.searchUsers("location:Taiwan", { limit: 2 });

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
