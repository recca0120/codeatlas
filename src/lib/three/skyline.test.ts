import { describe, expect, it } from "vitest";
import { createMockUser } from "../test-utils";
import { createSkyline, getBarHeight, getValue } from "./skyline";

describe("getBarHeight", () => {
  it("returns max height for max value", () => {
    expect(getBarHeight(1000, 1000)).toBe(20);
  });
  it("returns proportional height", () => {
    expect(getBarHeight(500, 1000)).toBe(10);
  });
  it("returns minimum height for zero", () => {
    expect(getBarHeight(0, 1000)).toBe(0.1);
  });
  it("handles zero maxValue", () => {
    expect(getBarHeight(0, 0)).toBe(0.1);
  });
});

describe("getValue", () => {
  it("returns publicContributions", () => {
    expect(
      getValue(
        createMockUser({ publicContributions: 500 }),
        "public_contributions",
      ),
    ).toBe(500);
  });
  it("returns total contributions", () => {
    expect(
      getValue(
        createMockUser({ publicContributions: 500, privateContributions: 200 }),
        "total_contributions",
      ),
    ).toBe(700);
  });
  it("returns followers", () => {
    expect(getValue(createMockUser({ followers: 100 }), "followers")).toBe(100);
  });
});

describe("createSkyline", () => {
  it("returns empty group for empty users", () => {
    expect(createSkyline([], "public_contributions").children).toHaveLength(0);
  });
  it("creates one mesh per user", () => {
    const users = [
      createMockUser({ login: "alice" }),
      createMockUser({ login: "bob" }),
    ];
    expect(createSkyline(users, "public_contributions").children).toHaveLength(
      2,
    );
  });
  it("stores user data on mesh", () => {
    const group = createSkyline(
      [createMockUser({ login: "alice" })],
      "public_contributions",
    );
    expect(group.children[0].userData.user.login).toBe("alice");
  });
});
