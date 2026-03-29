import { retry } from "@octokit/plugin-retry";
import { throttling } from "@octokit/plugin-throttling";
import { Octokit } from "@octokit/rest";
import type {
  GitHubClient,
  GitHubUser,
  RateLimitInfo,
  SearchOptions,
} from "./github-client";

const ThrottledOctokit = Octokit.plugin(throttling, retry);

interface RepoNode {
  name: string;
  description: string | null;
  stargazerCount: number;
  primaryLanguage: { name: string } | null;
}

interface SearchUserNode {
  login: string;
  avatarUrl: string;
  name: string | null;
  location: string | null;
  company: string | null;
  bio: string | null;
  twitterUsername: string | null;
  websiteUrl: string | null;
  followers: { totalCount: number };
  contributionsCollection?: {
    contributionCalendar: { totalContributions: number };
    restrictedContributionsCount: number;
  };
  repositories?: {
    nodes: RepoNode[];
  };
}

interface GraphQLSearchResponse {
  search: {
    userCount: number;
    nodes: Array<({ __typename: string } & SearchUserNode) | null>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
  rateLimit: { cost: number; remaining: number; resetAt: string };
}

const SEARCH_USERS_QUERY = `
  query ($searchQuery: String!, $first: Int!, $after: String) {
    search(type: USER, query: $searchQuery, first: $first, after: $after) {
      userCount
      nodes {
        __typename
        ... on User {
          login
          avatarUrl(size: 72)
          name
          location
          company
          bio
          twitterUsername
          websiteUrl
          followers {
            totalCount
          }
          contributionsCollection {
            contributionCalendar {
              totalContributions
            }
            restrictedContributionsCount
          }
          repositories(first: 5, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
            nodes {
              name
              description
              stargazerCount
              primaryLanguage { name }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
    rateLimit { cost remaining resetAt }
  }
`;

function mapNodeToUser(node: SearchUserNode): GitHubUser {
  const contrib = node.contributionsCollection;
  const repos = node.repositories?.nodes ?? [];
  return {
    login: node.login,
    avatarUrl: node.avatarUrl,
    name: node.name ?? null,
    company: node.company ?? null,
    location: node.location ?? null,
    bio: node.bio ?? null,
    followers: node.followers?.totalCount ?? 0,
    publicContributions:
      (contrib?.contributionCalendar?.totalContributions ?? 0) -
      (contrib?.restrictedContributionsCount ?? 0),
    privateContributions: contrib?.restrictedContributionsCount ?? 0,
    languages: [
      ...new Set(
        repos
          .map((r) => r.primaryLanguage?.name)
          .filter((n): n is string => n != null),
      ),
    ],
    topRepos: repos.map((r) => ({
      name: r.name,
      description: r.description,
      stars: r.stargazerCount,
      language: r.primaryLanguage?.name ?? null,
    })),
    twitterUsername: node.twitterUsername ?? null,
    blog: node.websiteUrl || null,
  };
}

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
      onSecondaryRateLimit: (retryAfter, options, _octokit, retryCount) => {
        console.warn(
          `Secondary rate limit for ${options.method} ${options.url} (retry ${retryCount + 1}, wait ${retryAfter}s)`,
        );
        return retryCount < 3;
      },
    },
    retry: { doNotRetry: [400, 401, 403, 404, 422] },
    request: { retries: 3 },
  });

  return {
    async searchUsers(
      query: string,
      options?: SearchOptions,
    ): Promise<GitHubUser[]> {
      const { onProgress, limit, pageSize = 20 } = options ?? {};
      const users: GitHubUser[] = [];
      let cursor: string | null = null;
      let hasNextPage = true;

      while (hasNextPage) {
        const result: GraphQLSearchResponse =
          await octokit.graphql<GraphQLSearchResponse>(SEARCH_USERS_QUERY, {
            searchQuery: `${query} sort:followers-desc`,
            first: pageSize,
            after: cursor,
          });

        const { nodes: searchNodes, pageInfo } = result.search;
        const { rateLimit } = result;
        hasNextPage = pageInfo.hasNextPage;
        cursor = pageInfo.endCursor;

        // Filter out null nodes (Organizations don't match User fragment)
        const userNodes = searchNodes.filter(
          (n): n is { __typename: string } & SearchUserNode =>
            n != null && n.__typename === "User" && "login" in n,
        );
        for (let idx = 0; idx < userNodes.length; idx++) {
          const node = userNodes[idx];
          onProgress?.(users.length + 1, node.login);
          users.push(mapNodeToUser(node));

          if (limit && users.length >= limit) {
            hasNextPage = false;
            break;
          }
        }

        // Delay between pages to avoid secondary rate limit
        if (hasNextPage) {
          const delay = 500 + Math.random() * 500;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        // Rate limit monitoring
        if (rateLimit.remaining < 100) {
          const resetAt = new Date(rateLimit.resetAt);
          const waitMs = resetAt.getTime() - Date.now() + 1000;
          if (waitMs > 0) {
            console.warn(
              `Rate limit low (${rateLimit.remaining}), waiting ${Math.ceil(waitMs / 1000)}s`,
            );
            await new Promise((resolve) => setTimeout(resolve, waitMs));
          }
        }
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
