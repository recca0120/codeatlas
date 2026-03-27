import fs from "node:fs/promises";
import path from "node:path";

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

export async function loadCountryConfig(
  filePath: string,
): Promise<CountryConfig> {
  const content = await fs.readFile(filePath, "utf-8");
  const data = JSON.parse(content);
  return validateCountryConfig(data);
}

export async function loadAllCountryConfigs(
  dirPath: string,
): Promise<CountryConfig[]> {
  let files: string[];
  try {
    files = await fs.readdir(dirPath);
  } catch {
    return [];
  }

  const jsonFiles = files.filter((f) => f.endsWith(".json")).sort();
  const configs: CountryConfig[] = [];

  for (const file of jsonFiles) {
    const config = await loadCountryConfig(path.join(dirPath, file));
    configs.push(config);
  }

  return configs;
}
