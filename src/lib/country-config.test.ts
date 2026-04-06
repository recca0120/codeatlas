import { describe, expect, it } from "vitest";
import { type CountryConfig, loadAllCountryConfigs } from "./country-config";

describe("loadAllCountryConfigs", () => {
  it("loads all configs from countries.json", async () => {
    const configs = await loadAllCountryConfigs("public/data/countries.json");
    expect(configs.length).toBeGreaterThanOrEqual(2);
    expect(configs.map((c) => c.code)).toContain("taiwan");
    expect(configs.map((c) => c.code)).toContain("japan");
  });

  it("validates each config has required fields", async () => {
    const configs = await loadAllCountryConfigs("public/data/countries.json");
    for (const config of configs) {
      expect(config.code).toBeDefined();
      expect(config.name).toBeDefined();
      expect(config.flag).toBeDefined();
      expect(config.locations.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("throws for non-existent file", async () => {
    await expect(
      loadAllCountryConfigs("config/nonexistent.json"),
    ).rejects.toThrow();
  });
});
