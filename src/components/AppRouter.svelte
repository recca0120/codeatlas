<script lang="ts">
  import CountryPage from "./CountryPage.svelte";
  import ProfilePage from "./ProfilePage.svelte";
  import { buildUrl } from "../lib/url";
  import { t } from "../i18n";

  let { basePath = "/", locale = "en" }: { basePath?: string; locale?: string } = $props();

  // Parse route from current URL
  let countryCode = $state("");
  let userName = $state("");

  $effect(() => {
    // Check ?route= param first (from 404.html redirect), then fall back to pathname
    const params = new URLSearchParams(window.location.search);
    const route = params.get("route");
    const rawPath = route || window.location.pathname;
    // Strip basePath and locale prefix
    let path = rawPath.replace(basePath, "");
    if (locale !== "en") {
      path = path.replace(new RegExp(`^/?${locale}/?`), "");
    }
    path = path.replace(/^\/|\/$/g, "");
    const parts = path.split("/").filter(Boolean);
    countryCode = parts[0] || "";
    userName = parts[1] || "";

    // Clean up URL if redirected from 404
    if (route) {
      const localePrefix = locale !== "en" ? locale + "/" : "";
      const cleanUrl = buildUrl(localePrefix + path + "/", basePath);
      window.history.replaceState({}, "", cleanUrl);
    }
  });
</script>

{#if userName && countryCode}
  <ProfilePage {countryCode} {userName} {basePath} {locale} />
{:else if countryCode}
  <CountryPage {countryCode} {basePath} {locale} />
{:else}
  <div class="max-w-3xl mx-auto px-6 py-20 text-center">
    <h1 class="text-2xl font-display font-bold mb-4">{t("app.pageNotFound", locale)}</h1>
    <a href={buildUrl("", basePath)} class="text-accent hover:underline">{t("app.backToHome", locale)}</a>
  </div>
{/if}
