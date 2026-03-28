/**
 * Build a URL path with the correct base prefix.
 * Works in both Astro frontmatter (build time) and Svelte (client-side).
 */
export function buildUrl(path: string, basePath?: string): string {
  const b =
    basePath ||
    (typeof import.meta !== "undefined"
      ? (import.meta as Record<string, any>).env?.BASE_URL
      : "/") ||
    "/";
  const normalizedBase = b.endsWith("/") ? b : `${b}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${normalizedBase}${normalizedPath}`;
}
