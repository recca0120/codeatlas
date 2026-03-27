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
    const result = await client.searchUsers("location:Taipei", 1);
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
  it("deduplicates users across locations", async () => {
    const alice = createMockUser({ login: "alice", location: "Taipei" });
    const bob = createMockUser({ login: "bob", location: "Kaohsiung" });
    const client = createFakeClient();
    (client.searchUsers as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([alice])
      .mockResolvedValueOnce([alice, bob]);

    const result = await searchUsersByLocation(client, ["Taiwan", "Kaohsiung"]);
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.login)).toContain("alice");
    expect(result.map((u) => u.login)).toContain("bob");
  });

  it("returns empty for no users", async () => {
    const client = createFakeClient([]);
    (client.searchUsers as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const result = await searchUsersByLocation(client, ["Nonexistent"]);
    expect(result).toHaveLength(0);
  });
});
