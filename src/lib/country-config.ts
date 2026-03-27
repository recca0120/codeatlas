import fs from "node:fs/promises";

export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  locations: string[];
}

export function validateCountryConfig(data: unknown): CountryConfig {
  const obj = data as Record<string, unknown>;

  if (!obj.code || typeof obj.code !== "string") {
    throw new Error("Missing or invalid field: code");
  }
  if (!obj.name || typeof obj.name !== "string") {
    throw new Error("Missing or invalid field: name");
  }
  if (!obj.flag || typeof obj.flag !== "string") {
    throw new Error("Missing or invalid field: flag");
  }
  if (!Array.isArray(obj.locations) || obj.locations.length === 0) {
    throw new Error(
      "Missing or invalid field: locations (must be a non-empty array)",
    );
  }

  return {
    code: obj.code,
    name: obj.name,
    flag: obj.flag,
    locations: obj.locations as string[],
  };
}

/**
 * Load all country configs from a single JSON file (array of configs).
 */
export async function loadAllCountryConfigs(
  filePath: string,
): Promise<CountryConfig[]> {
  const content = await fs.readFile(filePath, "utf-8");
  const data = JSON.parse(content);

  if (!Array.isArray(data)) {
    throw new Error("Expected an array of country configs");
  }

  return data.map(validateCountryConfig);
}

/**
 * Find a single country config by code.
 */
export async function loadCountryConfig(
  filePath: string,
  code: string,
): Promise<CountryConfig> {
  const all = await loadAllCountryConfigs(filePath);
  const found = all.find((c) => c.code === code);
  if (!found) throw new Error(`Country not found: ${code}`);
  return found;
}
