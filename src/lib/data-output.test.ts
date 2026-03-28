import { describe, expect, it } from "vitest";
import { buildCountryData } from "./data-output";
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
