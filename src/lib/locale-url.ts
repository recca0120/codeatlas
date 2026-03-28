import { type Locale, SUPPORTED_LOCALES } from "../i18n";

export function getOtherLocaleUrl(
  target: Locale,
  currentPath: string,
  basePath: string,
): string {
  const base = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  let path = currentPath;
  if (path.startsWith(base)) {
    path = path.slice(base.length);
  }
  for (const loc of SUPPORTED_LOCALES) {
    if (loc !== "en" && path.startsWith(`/${loc}/`)) {
      path = path.slice(`/${loc}`.length);
      break;
    }
    if (loc !== "en" && path === `/${loc}`) {
      path = "/";
      break;
    }
  }
  if (target === "en") {
    return base + (path || "/");
  }
  return base + "/" + target + (path || "/");
}
