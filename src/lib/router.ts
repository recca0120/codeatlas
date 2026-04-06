import { stripBasePath, stripLocalePrefix } from "./locale-url";

export function isModifiedClick(e: MouseEvent): boolean {
  return e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0;
}

export function navigate(path: string): void {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function getCurrentPath(basePath: string, locale?: string): string {
  let path = stripBasePath(window.location.pathname, basePath);
  if (locale && locale !== "en") {
    path = stripLocalePrefix(path);
  }
  return path || "/";
}
