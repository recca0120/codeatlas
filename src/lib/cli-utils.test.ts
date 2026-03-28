import { describe, expect, it } from "vitest";
import {
  buildOutputPath,
  filterCountries,
  generateFakeUsers,
  prioritizeCountry,
  shouldSkipCountry,
} from "./cli-utils";
import type { CountryConfig } from "./country-config";

const mockCountries: CountryConfig[] = [
  {
    code: "taiwan",
    name: "Taiwan",
    flag: "🇹🇼",
    locations: ["Taiwan", "Taipei"],
  },
  { code: "japan", name: "Japan", flag: "🇯🇵", locations: ["Japan", "Tokyo"] },
  {
    code: "germany",
    name: "Germany",
    flag: "🇩🇪",
    locations: ["Germany", "Berlin"],
  },
];

describe("generateFakeUsers", () => {
  it("produces the specified number of users", () => {
    const users = generateFakeUsers(
      "taiwan",
      "Taiwan",
      ["Taiwan", "Taipei"],
      10,
    );
    expect(users).toHaveLength(10);
  });

  it("each user has all required fields", () => {
    const users = generateFakeUsers("taiwan", "Taiwan", ["Taiwan"], 1);
    const u = users[0];
    expect(u.login).toBeDefined();
    expect(u.avatarUrl).toBeDefined();
    expect(u.name).toBeDefined();
    expect(u.followers).toBeTypeOf("number");
    expect(u.publicContributions).toBeTypeOf("number");
    expect(u.privateContributions).toBeTypeOf("number");
    expect(Array.isArray(u.languages)).toBe(true);
    expect(Array.isArray(u.topRepos)).toBe(true);
  });

  it("contributions decrease from first to last", () => {
    const users = generateFakeUsers("taiwan", "Taiwan", ["Taiwan"], 20);
    expect(users[0].publicContributions).toBeGreaterThan(
      users[19].publicContributions,
    );
  });

  it("each repo has required fields", () => {
    const users = generateFakeUsers("taiwan", "Taiwan", ["Taiwan"], 1);
    if (users[0].topRepos.length > 0) {
      const repo = users[0].topRepos[0];
      expect(repo.name).toBeDefined();
      expect(repo.stars).toBeTypeOf("number");
      expect(repo.language).toBeDefined();
    }
  });

  it("locations come from the provided list", () => {
    const locs = ["Taipei", "Kaohsiung"];
    const users = generateFakeUsers("taiwan", "Taiwan", locs, 50);
    for (const u of users) {
      expect(locs).toContain(u.location);
    }
  });
});

describe("buildOutputPath", () => {
  it("returns public/data/{code}.json", () => {
    expect(buildOutputPath("taiwan")).toBe("public/data/taiwan.json");
  });

  it("handles hyphenated codes", () => {
    expect(buildOutputPath("south-korea")).toBe("public/data/south-korea.json");
  });
});

describe("filterCountries", () => {
  it("returns all when no filter", () => {
    const result = filterCountries(mockCountries, undefined);
    expect(result).toHaveLength(3);
  });

  it("returns single country when filter matches", () => {
    const result = filterCountries(mockCountries, "taiwan");
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe("taiwan");
  });

  it("throws for unknown country code", () => {
    expect(() => filterCountries(mockCountries, "nonexistent")).toThrow();
  });
});

describe("prioritizeCountry", () => {
  it("moves the specified country to the front", () => {
    const codes = ["afghanistan", "japan", "taiwan", "germany"];
    expect(prioritizeCountry(codes, "taiwan")).toEqual([
      "taiwan",
      "afghanistan",
      "japan",
      "germany",
    ]);
  });

  it("returns unchanged if country is already first", () => {
    const codes = ["taiwan", "japan", "germany"];
    expect(prioritizeCountry(codes, "taiwan")).toEqual([
      "taiwan",
      "japan",
      "germany",
    ]);
  });

  it("returns unchanged if country is not in the list", () => {
    const codes = ["japan", "germany"];
    expect(prioritizeCountry(codes, "taiwan")).toEqual(["japan", "germany"]);
  });

  it("does not mutate the original array", () => {
    const codes = ["japan", "taiwan", "germany"];
    prioritizeCountry(codes, "taiwan");
    expect(codes).toEqual(["japan", "taiwan", "germany"]);
  });
});

describe("shouldSkipCountry", () => {
  it("returns true when updatedAt is today", () => {
    const today = new Date().toISOString().split("T")[0];
    expect(shouldSkipCountry(`${today}T00:00:00Z`, today)).toBe(true);
  });

  it("returns false when updatedAt is yesterday", () => {
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];
    const today = new Date().toISOString().split("T")[0];
    expect(shouldSkipCountry(`${yesterday}T00:00:00Z`, today)).toBe(false);
  });

  it("returns false when updatedAt is undefined", () => {
    const today = new Date().toISOString().split("T")[0];
    expect(shouldSkipCountry(undefined, today)).toBe(false);
  });

  it("returns false when updatedAt is empty string", () => {
    const today = new Date().toISOString().split("T")[0];
    expect(shouldSkipCountry("", today)).toBe(false);
  });
});
