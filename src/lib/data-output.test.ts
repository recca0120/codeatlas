import { describe, expect, it } from "vitest";
import {
  buildCountryData,
  buildCountrySummary,
  CountryDataSchema,
} from "./data-output";
import { createMockUser } from "./test-utils";

const users = [
  createMockUser({ login: "alice", followers: 100, publicContributions: 500 }),
  createMockUser({ login: "bob", followers: 300, publicContributions: 200 }),
];

describe("buildCountryData", () => {
  it("builds data with users only (no rankings)", () => {
    const data = buildCountryData("taiwan", users);
    expect(data.countryCode).toBe("taiwan");
    expect(data.updatedAt).toBeDefined();
    expect(data.users).toHaveLength(2);
    expect(data).not.toHaveProperty("rankings");
  });

  it("handles empty users", () => {
    const data = buildCountryData("taiwan", []);
    expect(data.users).toHaveLength(0);
  });
});

describe("CountryDataSchema.parse", () => {
  it("strips rankings from legacy data", () => {
    const legacy = {
      countryCode: "taiwan",
      updatedAt: "2026-03-28T00:00:00Z",
      users,
      rankings: {
        public_contributions: [...users],
        total_contributions: [...users],
        followers: [...users].reverse(),
      },
    };
    const result = CountryDataSchema.parse(legacy);
    expect(result).not.toHaveProperty("rankings");
    expect(result.countryCode).toBe("taiwan");
    expect(result.users).toHaveLength(2);
    expect(result.updatedAt).toBe("2026-03-28T00:00:00Z");
  });

  it("preserves data that is already clean", () => {
    const clean = buildCountryData("japan", users);
    const result = CountryDataSchema.parse(clean);
    expect(result).not.toHaveProperty("rankings");
    expect(result.users).toHaveLength(2);
  });
});

describe("buildCountrySummary", () => {
  it("builds summary with devCount and totalContributions", () => {
    const config = {
      code: "taiwan",
      name: "Taiwan",
      flag: "\u{1F1F9}\u{1F1FC}",
    };
    const data = buildCountryData("taiwan", users);
    const summary = buildCountrySummary(config, data);
    expect(summary.code).toBe("taiwan");
    expect(summary.name).toBe("Taiwan");
    expect(summary.flag).toBe("\u{1F1F9}\u{1F1FC}");
    expect(summary.devCount).toBe(2);
    expect(summary.totalContributions).toBe(700);
  });

  it("includes top 3 contributors sorted by publicContributions", () => {
    const config = {
      code: "taiwan",
      name: "Taiwan",
      flag: "\u{1F1F9}\u{1F1FC}",
    };
    const data = buildCountryData("taiwan", users);
    const summary = buildCountrySummary(config, data);
    expect(summary.topContributors).toHaveLength(2);
    expect(summary.topContributors[0].login).toBe("alice");
    expect(summary.topContributors[0].avatarUrl).toBeDefined();
    expect(summary.topContributors[1].login).toBe("bob");
  });

  it("limits topContributors to 3", () => {
    const manyUsers = [
      createMockUser({ login: "a", publicContributions: 500 }),
      createMockUser({ login: "b", publicContributions: 400 }),
      createMockUser({ login: "c", publicContributions: 300 }),
      createMockUser({ login: "d", publicContributions: 200 }),
      createMockUser({ login: "e", publicContributions: 100 }),
    ];
    const config = {
      code: "taiwan",
      name: "Taiwan",
      flag: "\u{1F1F9}\u{1F1FC}",
    };
    const data = buildCountryData("taiwan", manyUsers);
    const summary = buildCountrySummary(config, data);
    expect(summary.topContributors).toHaveLength(3);
    expect(summary.topContributors.map((c) => c.login)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("handles empty users", () => {
    const config = { code: "japan", name: "Japan", flag: "\u{1F1EF}\u{1F1F5}" };
    const data = buildCountryData("japan", []);
    const summary = buildCountrySummary(config, data);
    expect(summary.devCount).toBe(0);
    expect(summary.totalContributions).toBe(0);
    expect(summary.topContributors).toHaveLength(0);
  });
});
