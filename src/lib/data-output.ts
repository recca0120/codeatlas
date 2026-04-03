import { z } from "zod";
import { type GitHubUser, GitHubUserSchema } from "./github-client";

export const CountryInfoSchema = z.object({
  code: z.string(),
  name: z.string(),
  flag: z.string(),
});
export type CountryInfo = z.infer<typeof CountryInfoSchema>;

export const CountryDataSchema = z.object({
  countryCode: z.string(),
  updatedAt: z.string(),
  users: z.array(GitHubUserSchema),
});
export type CountryData = z.infer<typeof CountryDataSchema>;

export function rebuildCountryData(raw: unknown): CountryData {
  return CountryDataSchema.parse(raw);
}

export function buildCountryData(
  countryCode: string,
  users: GitHubUser[],
): CountryData {
  return {
    countryCode,
    updatedAt: new Date().toISOString(),
    users,
  };
}
