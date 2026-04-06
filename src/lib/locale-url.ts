import { type Locale, SUPPORTED_LOCALES } from "../i18n";
import { buildUrl } from "./url";

export function buildLocalePrefix(locale: string): string {
  return locale !== "en" ? `${locale}/` : "";
}

export function normalizeBase(basePath: string): string {
  return basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
}

export function stripBasePath(path: string, basePath: string): string {
  const base = normalizeBase(basePath);
  return base && path.startsWith(base) ? path.slice(base.length) : path;
}

export function stripLocalePrefix(path: string): string {
  for (const loc of SUPPORTED_LOCALES) {
    if (loc === "en") continue;
    if (path.startsWith(`/${loc}/`)) return path.slice(`/${loc}`.length);
    if (path === `/${loc}`) return "/";
  }
  return path;
}

export function buildCountryUrl(
  code: string,
  locale: string,
  basePath: string,
): string {
  return buildUrl(`${buildLocalePrefix(locale)}${code}/`, basePath);
}

export function getOtherLocaleUrl(
  target: Locale,
  currentPath: string,
  basePath: string,
): string {
  const base = normalizeBase(basePath);
  const path = stripLocalePrefix(stripBasePath(currentPath, basePath));
  if (target === "en") {
    return `${base}${path || "/"}`;
  }
  return `${base}/${target}${path || "/"}`;
}
