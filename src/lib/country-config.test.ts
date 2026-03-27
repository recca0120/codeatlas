import { describe, expect, it } from "vitest";
import {
  type CountryConfig,
  loadAllCountryConfigs,
  loadCountryConfig,
  validateCountryConfig,
} from "./country-config";

describe("validateCountryConfig", () => {
  it("accepts a valid config", () => {
    const config: CountryConfig = {
      code: "taiwan",
      name: "Taiwan",
      flag: "🇹🇼",
      locations: ["Taiwan", "Taipei"],
    };
    expect(validateCountryConfig(config)).toEqual(config);
  });

  it("throws when code is missing", () => {
    const config = { name: "Taiwan", flag: "🇹🇼", locations: ["Taiwan"] };
    expect(() => validateCountryConfig(config)).toThrow("code");
  });

  it("throws when name is missing", () => {
    const config = { code: "taiwan", flag: "🇹🇼", locations: ["Taiwan"] };
    expect(() => validateCountryConfig(config)).toThrow("name");
  });

  it("throws when locations is empty", () => {
    const config = { code: "taiwan", name: "Taiwan", flag: "🇹🇼", locations: [] };
    expect(() => validateCountryConfig(config)).toThrow("locations");
  });

  it("throws when locations is not an array", () => {
    const config = { code: "taiwan", name: "Taiwan", flag: "🇹🇼", locations: "Taiwan" };
    expect(() => validateCountryConfig(config)).toThrow("locations");
  });
});

describe("loadAllCountryConfigs", () => {
  it("loads all configs from countries.json", async () => {
    const configs = await loadAllCountryConfigs("config/countries.json");
    expect(configs.length).toBeGreaterThanOrEqual(2);
    expect(configs.map((c) => c.code)).toContain("taiwan");
    expect(configs.map((c) => c.code)).toContain("japan");
  });

  it("throws for non-existent file", async () => {
    await expect(loadAllCountryConfigs("config/nonexistent.json")).rejects.toThrow();
  });
});

describe("loadCountryConfig", () => {
  it("finds taiwan by code", async () => {
    const config = await loadCountryConfig("config/countries.json", "taiwan");
    expect(config.code).toBe("taiwan");
    expect(config.name).toBe("Taiwan");
    expect(config.flag).toBe("🇹🇼");
  });

  it("throws for unknown country code", async () => {
    await expect(loadCountryConfig("config/countries.json", "nonexistent")).rejects.toThrow("not found");
  });
});
