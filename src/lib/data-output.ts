import type { GitHubUser } from "./github-client";
import { type RankingDimension, rankUsers } from "./ranking";

export interface CountryData {
  countryCode: string;
  updatedAt: string;
  users: GitHubUser[];
  rankings: Record<RankingDimension, GitHubUser[]>;
}

export function buildCountryData(
  countryCode: string,
  users: GitHubUser[],
): CountryData {
  return {
    countryCode,
    updatedAt: new Date().toISOString(),
    users,
    rankings: {
      public_contributions: rankUsers(users, "public_contributions"),
      total_contributions: rankUsers(users, "total_contributions"),
      followers: rankUsers(users, "followers"),
    },
  };
}
