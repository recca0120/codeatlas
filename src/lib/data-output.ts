import type { GitHubUser } from "./github-client";

export interface CountryData {
  countryCode: string;
  updatedAt: string;
  users: GitHubUser[];
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
