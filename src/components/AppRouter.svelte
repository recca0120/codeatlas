<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import HomePage from "./HomePage.svelte";
  import FaqPage from "./FaqPage.svelte";
  import CountryPage from "./CountryPage.svelte";
  import ProfilePage from "./ProfilePage.svelte";
  import { buildUrl } from "../lib/url";
  import { getCurrentPath, navigate } from "../lib/router";
  import { t } from "../i18n";
  import { trackEvent } from "../lib/analytics";

  let { basePath = "/", locale = "en" }: { basePath?: string; locale?: string } = $props();

  let currentPath = $state("/");

  function parseRoute() {
    // Check ?route= param first (from 404.html redirect)
    const params = new URLSearchParams(window.location.search);
    const route = params.get("route");

    if (route) {
      // Clean up URL from 404 redirect, preserving original query params
      let path = route.replace(/^\/|\/$/g, "");
      const localePrefix = locale !== "en" ? locale + "/" : "";
      const cleanUrl = buildUrl(localePrefix + path + "/", basePath);
      // Rebuild query string without the 'route' param
      params.delete("route");
      const remaining = params.toString();
      window.history.replaceState({}, "", cleanUrl + (remaining ? "?" + remaining : ""));
    }

    currentPath = getCurrentPath(basePath.replace(/\/$/, ""), locale !== "en" ? locale : undefined);
    trackEvent("page_view", { page_path: window.location.pathname });
  }

  function onPopState() {
    parseRoute();
  }

  function onLinkClick(e: MouseEvent) {
    if (e.defaultPrevented) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const anchor = (e.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
    if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
    if (anchor.origin !== window.location.origin) return;
    e.preventDefault();
    navigate(anchor.href);
  }

  onMount(() => {
    parseRoute();
    window.addEventListener("popstate", onPopState);
    document.addEventListener("click", onLinkClick);
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onLinkClick);
    }
  });

  const segments = $derived(currentPath.replace(/^\/|\/$/g, "").split("/").filter(Boolean));
  const countryCode = $derived(segments[0] || "");
  const userName = $derived(segments[1] || "");
</script>

{#if currentPath === "/" || currentPath === ""}
  <HomePage {basePath} {locale} />
{:else if currentPath === "/faq" || currentPath === "/faq/"}
  <FaqPage {basePath} {locale} />
{:else if userName && countryCode}
  <ProfilePage {countryCode} {userName} {basePath} {locale} />
{:else if countryCode}
  <CountryPage {countryCode} {basePath} {locale} />
{:else}
  <div class="max-w-3xl mx-auto px-6 py-20 text-center">
    <h1 class="text-2xl font-display font-bold mb-4">{t("app.pageNotFound", locale)}</h1>
    <a href={buildUrl("", basePath)} class="text-accent hover:underline">{t("app.backToHome", locale)}</a>
  </div>
{/if}
