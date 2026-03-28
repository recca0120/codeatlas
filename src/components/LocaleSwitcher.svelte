<script lang="ts">
  import type { Locale } from "../i18n";
  import { getOtherLocaleUrl } from "../lib/locale-url";

  let { locale = "en", basePath = "/" }: { locale?: string; basePath?: string } = $props();

  const targetLocale = $derived((locale === "en" ? "zh-TW" : "en") as Locale);
  const label = $derived(locale === "en" ? "中文" : "EN");

  function switchLocale() {
    localStorage.setItem("locale", targetLocale);
    window.location.href = getOtherLocaleUrl(targetLocale, window.location.pathname, basePath);
  }
</script>

<button
  onclick={switchLocale}
  class="px-2 py-1 text-sm text-text-muted hover:text-text transition-colors cursor-pointer"
>{label}</button>
