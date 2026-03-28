export function navigate(path: string): void {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function getCurrentPath(basePath: string, locale?: string): string {
  const base = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  let path = window.location.pathname;
  if (base && path.startsWith(base)) {
    path = path.slice(base.length);
  }
  if (locale && locale !== "en" && path.startsWith(`/${locale}/`)) {
    path = path.slice(`/${locale}`.length);
  } else if (locale && locale !== "en" && path === `/${locale}`) {
    path = "/";
  }
  return path || "/";
}
