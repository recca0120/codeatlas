<script lang="ts">
  import { SUPPORTED_LOCALES, t, type Locale } from "../i18n";

  let { locale = "en", basePath = "/", currentPath = "/" }: { locale?: string; basePath?: string; currentPath?: string } = $props();

  function getOtherLocaleUrl(targetLocale: Locale): string {
    const base = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
    // Strip base from current path
    let path = currentPath;
    if (path.startsWith(base)) {
      path = path.slice(base.length);
    }
    // Strip current locale prefix if present
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
    // Build new URL with target locale prefix
    if (targetLocale === "en") {
      return base + (path || "/");
    }
    return base + "/" + targetLocale + (path || "/");
  }

  function switchLocale(targetLocale: Locale) {
    localStorage.setItem("locale", targetLocale);
    window.location.href = getOtherLocaleUrl(targetLocale);
  }
</script>

<div class="flex items-center gap-1 text-sm">
  {#each SUPPORTED_LOCALES as loc}
    {#if loc === locale}
      <span class="px-1.5 py-0.5 text-accent font-semibold">{t(`locale.${loc}` as any, locale)}</span>
    {:else}
      <button
        onclick={() => switchLocale(loc)}
        class="px-1.5 py-0.5 text-text-muted hover:text-text transition-colors cursor-pointer"
      >{t(`locale.${loc}` as any, locale)}</button>
    {/if}
    {#if loc !== SUPPORTED_LOCALES[SUPPORTED_LOCALES.length - 1]}
      <span class="text-text-muted/50">|</span>
    {/if}
  {/each}
</div>
