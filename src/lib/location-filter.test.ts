import { describe, expect, it } from "vitest";
import { shouldExcludeUser } from "./location-filter";

describe("shouldExcludeUser", () => {
  it("excludes US Georgia user when searching for country Georgia", () => {
    expect(shouldExcludeUser("georgia", "Atlanta, Georgia, USA")).toBe(true);
  });

  it("keeps Tbilisi user when searching for country Georgia", () => {
    expect(shouldExcludeUser("georgia", "Tbilisi, Georgia")).toBe(false);
  });

  it("excludes Granada Spain user when searching for Nicaragua", () => {
    expect(shouldExcludeUser("nicaragua", "Granada, Spain")).toBe(true);
  });

  it("keeps user with no ambiguity", () => {
    expect(shouldExcludeUser("taiwan", "Taipei, Taiwan")).toBe(false);
  });

  it("handles null location", () => {
    expect(shouldExcludeUser("taiwan", null)).toBe(false);
  });
});
