import type { GitHubUser } from "./github-client";

export type RankingDimension =
  | "public_contributions"
  | "total_contributions"
  | "followers";

function getRankValue(user: GitHubUser, dimension: RankingDimension): number {
  switch (dimension) {
    case "public_contributions":
      return user.publicContributions;
    case "total_contributions":
      return user.publicContributions + user.privateContributions;
    case "followers":
      return user.followers;
  }
}

export function buildRankMap(rankedUsers: GitHubUser[]): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = 0; i < rankedUsers.length; i++) {
    map.set(rankedUsers[i].login, i + 1);
  }
  return map;
}

export function rankUsers(
  users: GitHubUser[],
  dimension: RankingDimension,
): GitHubUser[] {
  const sorted = [...users];
  sorted.sort(
    (a, b) => getRankValue(b, dimension) - getRankValue(a, dimension),
  );
  return sorted;
}
