<script lang="ts">
  import CountryPage from "./CountryPage.svelte";
  import ProfilePage from "./ProfilePage.svelte";

  let { basePath = "/" }: { basePath?: string } = $props();

  // Parse route from current URL
  let countryCode = $state("");
  let userName = $state("");

  $effect(() => {
    // Check ?route= param first (from 404.html redirect), then fall back to pathname
    const params = new URLSearchParams(window.location.search);
    const route = params.get("route");
    const rawPath = route || window.location.pathname;
    const path = rawPath.replace(basePath, "").replace(/^\/|\/$/g, "");
    const parts = path.split("/").filter(Boolean);
    countryCode = parts[0] || "";
    userName = parts[1] || "";

    // Clean up URL if redirected from 404
    if (route) {
      const cleanUrl = basePath + path + "/";
      window.history.replaceState({}, "", cleanUrl);
    }
  });
</script>

{#if userName && countryCode}
  <ProfilePage {countryCode} {userName} {basePath} />
{:else if countryCode}
  <CountryPage {countryCode} {basePath} />
{:else}
  <div class="max-w-3xl mx-auto px-6 py-20 text-center">
    <h1 class="text-2xl font-display font-bold mb-4">Page not found</h1>
    <a href={basePath} class="text-accent hover:underline">← Back to CodeAtlas</a>
  </div>
{/if}
