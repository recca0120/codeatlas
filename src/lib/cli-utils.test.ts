import fs from "node:fs/promises";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildOutputPath,
  filterCountries,
  generateFakeUsers,
  getCheckpointCountry,
  loadCheckpoint,
  nextCheckpoint,
  saveCheckpoint,
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

describe("getCheckpointCountry", () => {
  it("returns the country at the checkpoint index", () => {
    const result = getCheckpointCountry(mockCountries, 1);
    expect(result).toEqual(mockCountries[1]);
  });

  it("returns the first country when checkpoint is 0", () => {
    const result = getCheckpointCountry(mockCountries, 0);
    expect(result).toEqual(mockCountries[0]);
  });

  it("wraps around when checkpoint exceeds length", () => {
    const result = getCheckpointCountry(mockCountries, 3);
    expect(result).toEqual(mockCountries[0]);
  });

  it("wraps around for large values", () => {
    const result = getCheckpointCountry(mockCountries, 7);
    expect(result).toEqual(mockCountries[1]);
  });
});

describe("nextCheckpoint", () => {
  it("increments by 1", () => {
    expect(nextCheckpoint(0, 3)).toBe(1);
  });

  it("wraps to 0 at the end", () => {
    expect(nextCheckpoint(2, 3)).toBe(0);
  });

  it("wraps from beyond length", () => {
    expect(nextCheckpoint(5, 3)).toBe(0);
  });
});

describe("loadCheckpoint", () => {
  const testPath = "public/data/test-checkpoint.json";

  afterEach(async () => {
    await fs.unlink(testPath).catch(() => {});
  });

  it("returns 0 when file does not exist", async () => {
    expect(await loadCheckpoint(testPath)).toBe(0);
  });

  it("reads checkpoint from file", async () => {
    await fs.writeFile(testPath, JSON.stringify({ checkpoint: 42 }));
    expect(await loadCheckpoint(testPath)).toBe(42);
  });
});

describe("saveCheckpoint", () => {
  const testPath = "public/data/test-checkpoint.json";

  afterEach(async () => {
    await fs.unlink(testPath).catch(() => {});
  });

  it("writes checkpoint to file", async () => {
    await saveCheckpoint(testPath, 7);
    const content = JSON.parse(await fs.readFile(testPath, "utf-8"));
    expect(content).toEqual({ checkpoint: 7 });
  });
});
