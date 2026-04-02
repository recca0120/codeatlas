<script lang="ts">
  import { buildUrl } from "../lib/url";
  import { t } from "../i18n";
  import SearchIcon from "./icons/SearchIcon.svelte";

  interface Country {
    code: string;
    name: string;
    flag: string;
  }

  let { countries, basePath = "/", locale = "en" }: { countries: Country[]; basePath?: string; locale?: string } = $props();

  let query = $state("");
  let focused = $state(false);

  const filtered = $derived(
    query.length > 0
      ? countries.filter(c =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.code.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8)
      : []
  );
</script>

<div class="relative">
  <div class="relative">
    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
      <SearchIcon />
    </span>
    <input
      type="text"
      placeholder={t("search.placeholder", locale)}
      bind:value={query}
      onfocus={() => focused = true}
      onblur={() => setTimeout(() => focused = false, 200)}
      class="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-text
        placeholder:text-text-muted font-body focus:outline-none focus:border-accent/40 transition-colors"
    />
  </div>

  {#if focused && filtered.length > 0}
    <div class="absolute z-50 top-full mt-1 left-0 right-0 bg-surface border border-border rounded-lg shadow-2xl overflow-hidden">
      {#each filtered as country}
        <a
          href={buildUrl(`${locale !== "en" ? locale + "/" : ""}${country.code}/`, basePath)}
          class="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-hover transition-colors text-sm"
        >
          <span class="text-lg">{country.flag}</span>
          <span class="text-text">{country.name}</span>
        </a>
      {/each}
    </div>
  {/if}
</div>
