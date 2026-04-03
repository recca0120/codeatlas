<script lang="ts">
  import type { Locale } from "../i18n";
  import { getOtherLocaleUrl } from "../lib/locale-url";
  import { trackEvent } from "../lib/analytics";

  let { locale = "en", basePath = "/" }: { locale?: string; basePath?: string } = $props();

  const targetLocale = $derived((locale === "en" ? "zh-TW" : "en") as Locale);
  const label = $derived(locale === "en" ? "中文" : "EN");

  function switchLocale() {
    trackEvent("locale_switch", { from: locale, to: targetLocale });
    localStorage.setItem("locale", targetLocale);
    window.location.href = getOtherLocaleUrl(targetLocale, window.location.pathname, basePath);
  }
</script>

<button
  onclick={switchLocale}
  class="px-2 py-1 text-sm text-text-muted hover:text-text transition-colors cursor-pointer"
>{label}</button>
