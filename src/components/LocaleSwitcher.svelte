<script lang="ts">
  import { SUPPORTED_LOCALES, type Locale } from "../i18n";

  let { locale = "en", basePath = "/", currentPath = "/" }: { locale?: string; basePath?: string; currentPath?: string } = $props();

  const targetLocale = $derived(locale === "en" ? "zh-TW" : "en") as Locale;
  const label = $derived(locale === "en" ? "中文" : "EN");

  function getOtherLocaleUrl(target: Locale): string {
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

  function switchLocale() {
    localStorage.setItem("locale", targetLocale);
    window.location.href = getOtherLocaleUrl(targetLocale);
  }
</script>

<button
  onclick={switchLocale}
  class="px-2 py-1 text-sm text-text-muted hover:text-text transition-colors cursor-pointer"
>{label}</button>
