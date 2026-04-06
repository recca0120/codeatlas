import fs from "node:fs/promises";
import { z } from "zod";

const CountryConfigSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  flag: z.string().min(1),
  locations: z.array(z.string()).min(1),
});
export type CountryConfig = z.infer<typeof CountryConfigSchema>;

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

  return data.map((d: unknown) => CountryConfigSchema.parse(d));
}
