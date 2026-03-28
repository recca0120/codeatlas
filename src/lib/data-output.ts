import type { GitHubUser } from "./github-client";

export interface CountryData {
  countryCode: string;
  updatedAt: string;
  users: GitHubUser[];
}

export function rebuildCountryData(raw: Record<string, unknown>): CountryData {
  const { countryCode, updatedAt, users } = raw as CountryData &
    Record<string, unknown>;
  return { countryCode, updatedAt, users: users ?? [] };
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
