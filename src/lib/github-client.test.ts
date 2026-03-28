import { describe, expect, it, vi } from "vitest";
import { type GitHubClient, searchUsersByLocation } from "./github-client";
import { createMockUser } from "./test-utils";

function createFakeClient(users = [createMockUser()]): GitHubClient {
  return {
    searchUsers: vi.fn().mockResolvedValue(users),
    getRateLimit: vi
      .fn()
      .mockResolvedValue({ remaining: 5000, resetAt: new Date() }),
  };
}

describe("GitHubClient interface", () => {
  it("searchUsers returns user array", async () => {
    const fakeUsers = [
      createMockUser({ login: "alice", publicContributions: 500 }),
    ];
    const client = createFakeClient(fakeUsers);
    const result = await client.searchUsers("location:Taipei");
    expect(result).toEqual(fakeUsers);
  });

  it("getRateLimit returns remaining and resetAt", async () => {
    const client = createFakeClient();
    const rateLimit = await client.getRateLimit();
    expect(rateLimit.remaining).toBe(5000);
    expect(rateLimit.resetAt).toBeInstanceOf(Date);
  });
});

describe("searchUsersByLocation", () => {
  it("combines locations into a single query", async () => {
    const alice = createMockUser({ login: "alice", location: "Taipei" });
    const client = createFakeClient([alice]);

    await searchUsersByLocation(client, ["Taiwan", "Taipei"]);

    expect(client.searchUsers).toHaveBeenCalledTimes(1);
    expect(client.searchUsers).toHaveBeenCalledWith(
      "location:Taiwan location:Taipei",
      expect.objectContaining({}),
    );
  });

  it("deduplicates users from results", async () => {
    const alice = createMockUser({ login: "alice", location: "Taipei" });
    const bob = createMockUser({ login: "bob", location: "Kaohsiung" });
    const client = createFakeClient([alice, alice, bob]);

    const result = await searchUsersByLocation(client, ["Taiwan"]);
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.login)).toEqual(["alice", "bob"]);
  });

  it("returns empty for no users", async () => {
    const client = createFakeClient([]);
    const result = await searchUsersByLocation(client, ["Nonexistent"]);
    expect(result).toHaveLength(0);
  });

  it("filters out excluded users by location", async () => {
    const alice = createMockUser({
      login: "alice",
      location: "Taipei, Taiwan",
    });
    const bob = createMockUser({ login: "bob", location: "Georgia, US" });
    const client = createFakeClient([alice, bob]);

    const result = await searchUsersByLocation(client, ["Taiwan"], "taiwan");
    // bob should be excluded by location filter (not matching taiwan)
    expect(result.map((u) => u.login)).toContain("alice");
  });

  it("passes onProgress callback to searchUsers", async () => {
    const users = [createMockUser({ login: "alice", location: "Taipei" })];
    const client = createFakeClient(users);
    const onProgress = vi.fn();

    await searchUsersByLocation(client, ["Taiwan"], undefined, onProgress);
    expect(client.searchUsers).toHaveBeenCalledWith(
      "location:Taiwan",
      expect.objectContaining({ onProgress }),
    );
  });

  it("passes limit to searchUsers", async () => {
    const users = Array.from({ length: 50 }, (_, i) =>
      createMockUser({ login: `user-${i}`, location: "Taipei" }),
    );
    const client = createFakeClient(users);

    const result = await searchUsersByLocation(
      client, ["Taiwan"], undefined, undefined, 20,
    );
    expect(result).toHaveLength(20);
    expect(client.searchUsers).toHaveBeenCalledWith(
      "location:Taiwan",
      expect.objectContaining({ limit: 20 }),
    );
  });
});
