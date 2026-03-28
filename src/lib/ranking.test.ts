import { describe, expect, it } from "vitest";
import { buildRankMap, rankUsers } from "./ranking";
import { createMockUser } from "./test-utils";

const users = [
  createMockUser({
    login: "alice",
    followers: 100,
    publicContributions: 500,
    privateContributions: 100,
  }),
  createMockUser({
    login: "bob",
    followers: 300,
    publicContributions: 200,
    privateContributions: 900,
  }),
  createMockUser({
    login: "carol",
    followers: 50,
    publicContributions: 800,
    privateContributions: 50,
  }),
];

describe("rankUsers", () => {
  it("ranks by publicContributions descending", () => {
    const ranked = rankUsers(users, "public_contributions");
    expect(ranked[0].login).toBe("carol");
    expect(ranked[1].login).toBe("alice");
    expect(ranked[2].login).toBe("bob");
  });

  it("ranks by totalContributions (public + private) descending", () => {
    const ranked = rankUsers(users, "total_contributions");
    expect(ranked[0].login).toBe("bob");
    expect(ranked[1].login).toBe("carol");
    expect(ranked[2].login).toBe("alice");
  });

  it("ranks by followers descending", () => {
    const ranked = rankUsers(users, "followers");
    expect(ranked[0].login).toBe("bob");
    expect(ranked[1].login).toBe("alice");
    expect(ranked[2].login).toBe("carol");
  });

  it("returns empty array for empty input", () => {
    expect(rankUsers([], "followers")).toEqual([]);
  });

  it("preserves original array (no mutation)", () => {
    const original = [...users];
    rankUsers(users, "followers");
    expect(users).toEqual(original);
  });
});

describe("buildRankMap", () => {
  it("maps login to 1-based rank from original order", () => {
    const ranked = rankUsers(users, "public_contributions");
    const map = buildRankMap(ranked);
    expect(map.get("carol")).toBe(1);
    expect(map.get("alice")).toBe(2);
    expect(map.get("bob")).toBe(3);
  });

  it("returns correct rank regardless of filtered subset", () => {
    const ranked = rankUsers(users, "public_contributions");
    const map = buildRankMap(ranked);
    // Even if we only display bob, his rank should still be 3
    expect(map.get("bob")).toBe(3);
  });

  it("returns empty map for empty input", () => {
    expect(buildRankMap([])).toEqual(new Map());
  });
});
