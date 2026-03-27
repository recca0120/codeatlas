import type { KyInstance } from "ky";
import ky from "ky";

/**
 * Create a ky HTTP client with the app's base path as prefix.
 * All requests will be relative to this base.
 *
 * Usage:
 *   const http = createHttpClient("/codeatlas/");
 *   const data = await http.get("data/taiwan.json").json();
 *   // → GET /codeatlas/data/taiwan.json
 */
export function createHttpClient(basePath = "/"): KyInstance {
  const prefix = basePath.endsWith("/") ? basePath : `${basePath}/`;

  return ky.create({
    prefixUrl: prefix,
    retry: { limit: 2 },
    timeout: 15_000,
  });
}
