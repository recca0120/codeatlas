import { describe, expect, it } from "vitest";
import {
  buildCountryData,
  buildCountrySummary,
  rebuildCountryData,
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

describe("rebuildCountryData", () => {
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
    const result = rebuildCountryData(legacy);
    expect(result).not.toHaveProperty("rankings");
    expect(result.countryCode).toBe("taiwan");
    expect(result.users).toHaveLength(2);
    expect(result.updatedAt).toBe("2026-03-28T00:00:00Z");
  });

  it("preserves data that is already clean", () => {
    const clean = buildCountryData("japan", users);
    const result = rebuildCountryData(clean);
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

  it("handles empty users", () => {
    const config = { code: "japan", name: "Japan", flag: "\u{1F1EF}\u{1F1F5}" };
    const data = buildCountryData("japan", []);
    const summary = buildCountrySummary(config, data);
    expect(summary.devCount).toBe(0);
    expect(summary.totalContributions).toBe(0);
  });
});
