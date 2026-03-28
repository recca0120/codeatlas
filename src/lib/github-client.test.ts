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
import { searchUsersByLocation } from "./github-client";
import { createOctokitClient } from "./octokit-github-client";
import { makeUserNode, mockGraphqlSearch } from "./test-helpers/github-mocks";

beforeAll(() => fetchMock.activate({ onUnhandledRequest: "error" }));
afterAll(() => fetchMock.deactivate());
afterEach(() => {
  fetchMock.assertNoPendingInterceptors();
  fetchMock.reset();
});

describe("searchUsersByLocation", () => {
  it("deduplicates users from results", async () => {
    mockGraphqlSearch([
      makeUserNode({ login: "alice", location: "Taipei" }),
      makeUserNode({ login: "alice", location: "Taipei" }),
      makeUserNode({ login: "bob", location: "Kaohsiung" }),
    ]);

    const client = createOctokitClient("fake-token");
    const result = await searchUsersByLocation(client, ["Taiwan"]);

    expect(result).toHaveLength(2);
    expect(result.map((u) => u.login)).toEqual(["alice", "bob"]);
  });

  it("returns empty for no users", async () => {
    mockGraphqlSearch([]);

    const client = createOctokitClient("fake-token");
    const result = await searchUsersByLocation(client, ["Nonexistent"]);

    expect(result).toHaveLength(0);
  });

  it("filters out excluded users by location", async () => {
    mockGraphqlSearch([
      makeUserNode({ login: "alice", location: "Taipei, Taiwan" }),
      makeUserNode({ login: "bob", location: "Georgia, US" }),
    ]);

    const client = createOctokitClient("fake-token");
    const result = await searchUsersByLocation(client, ["Taiwan"], {
      countryCode: "taiwan",
    });

    expect(result.map((u) => u.login)).toContain("alice");
  });

  it("passes onProgress callback through to searchUsers", async () => {
    mockGraphqlSearch([makeUserNode({ login: "alice", location: "Taipei" })]);

    const client = createOctokitClient("fake-token");
    const onProgress = vi.fn();

    await searchUsersByLocation(client, ["Taiwan"], { onProgress });

    expect(onProgress).toHaveBeenCalledWith(1, "alice");
  });

  it("respects limit option", async () => {
    mockGraphqlSearch(
      Array.from({ length: 10 }, (_, i) =>
        makeUserNode({ login: `user-${i}`, location: "Taipei" }),
      ),
    );

    const client = createOctokitClient("fake-token");
    const result = await searchUsersByLocation(client, ["Taiwan"], {
      limit: 3,
    });

    expect(result).toHaveLength(3);
  });
});
