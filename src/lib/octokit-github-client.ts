import { retry } from "@octokit/plugin-retry";
import { throttling } from "@octokit/plugin-throttling";
import { Octokit } from "@octokit/rest";
import type { GitHubClient, GitHubUser, RateLimitInfo } from "./github-client";

const ThrottledOctokit = Octokit.plugin(throttling, retry);

interface ContributionResponse {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
      };
      restrictedContributionsCount: number;
    };
  };
}

const CONTRIBUTION_QUERY = `
  query ($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
        }
        restrictedContributionsCount
      }
    }
  }
`;

export function createOctokitClient(token: string): GitHubClient {
  const octokit = new ThrottledOctokit({
    auth: token,
    userAgent: "gitstar/1.0.0",
    throttle: {
      onRateLimit: (retryAfter, options, _octokit, retryCount) => {
        console.warn(
          `Rate limit for ${options.method} ${options.url} (retry ${retryCount + 1}, wait ${retryAfter}s)`,
        );
        return retryCount < 2;
      },
      onSecondaryRateLimit: (retryAfter, options) => {
        console.warn(
          `Secondary rate limit for ${options.method} ${options.url}, wait ${retryAfter}s`,
        );
        return false;
      },
    },
    retry: { doNotRetry: [400, 401, 403, 404, 422] },
    request: { retries: 3 },
  });

  return {
    async searchUsers(query: string, page: number): Promise<GitHubUser[]> {
      const { data } = await octokit.rest.search.users({
        q: query,
        sort: "followers",
        order: "desc",
        per_page: 100,
        page,
      });

      const users: GitHubUser[] = [];

      for (const item of data.items) {
        const { data: profile } = await octokit.rest.users.getByUsername({
          username: item.login,
        });

        let publicContributions = 0;
        let privateContributions = 0;
        try {
          const contribData = await octokit.graphql<ContributionResponse>(
            CONTRIBUTION_QUERY,
            {
              username: item.login,
            },
          );
          publicContributions =
            contribData.user.contributionsCollection.contributionCalendar
              .totalContributions;
          privateContributions =
            contribData.user.contributionsCollection
              .restrictedContributionsCount;
        } catch {
          // GraphQL may fail for some users; default to 0
        }

        users.push({
          login: item.login,
          avatarUrl: item.avatar_url,
          name: profile.name ?? null,
          company: profile.company ?? null,
          location: profile.location ?? null,
          bio: profile.bio ?? null,
          followers: profile.followers ?? 0,
          publicContributions,
          privateContributions,
          languages: [],
          topRepos: [],
          twitterUsername: (profile as any).twitter_username ?? null,
          blog: profile.blog || null,
        });
      }

      return users;
    },

    async getRateLimit(): Promise<RateLimitInfo> {
      const { data } = await octokit.rest.rateLimit.get();
      return {
        remaining: data.rate.remaining,
        resetAt: new Date(data.rate.reset * 1000),
      };
    },
  };
}
