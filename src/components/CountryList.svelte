<script lang="ts">
  import { buildUrl } from "../lib/url";
  import { t } from "../i18n";
  import { trackEvent } from "../lib/analytics";
  import { buildCountryUrl } from "../lib/locale-url";
  import {
    CONTINENTS,
    CONTINENT_MAP,
    groupByContinent,
    filterCountriesByQuery,
    sortCountries,
    calcHeat,
    type CountrySummary,
    type SortKey,
  } from "../lib/country-list";
  import SearchIcon from "./icons/SearchIcon.svelte";
  import Link from "./Link.svelte";
  import { fmtNum } from "../lib/format";

  let { countries, basePath = "/", locale = "en" }: { countries: CountrySummary[]; basePath?: string; locale?: string } = $props();

  let activeTab = $state<string>("All");
  let searchQuery = $state("");
  let sortKey = $state<SortKey>("name");

  const byContinent = $derived(groupByContinent(countries));
  const availableTabs = $derived(CONTINENTS.filter(c => byContinent[c]));

  const visibleCountries = $derived.by(() => {
    let list = activeTab === "All" ? countries : (byContinent[activeTab] ?? []);
    list = filterCountriesByQuery(list, searchQuery);
    return sortCountries(list, sortKey);
  });

  const maxDevs = $derived(Math.max(...countries.map(c => c.devCount), 0));
  const maxContributions = $derived(Math.max(...countries.map(c => c.totalContributions), 0));

  const totalDevs = $derived(visibleCountries.reduce((s, c) => s + c.devCount, 0));

  const CONT_KEYS: Record<string, string> = { Asia: "continent.asia", Europe: "continent.europe", Americas: "continent.americas", Africa: "continent.africa", Oceania: "continent.oceania" };

  const visibleByContinent = $derived.by(() => {
    if (activeTab !== "All") return null;
    return groupByContinent(visibleCountries);
  });

  function switchTab(tab: string) {
    activeTab = tab;
    trackEvent("country_tab_switch", { tab });
  }

  function setSort(key: SortKey) {
    sortKey = key;
    trackEvent("country_sort", { sort: key });
  }
</script>

<section class="py-16 border-t border-border">
  <h2 class="text-xl font-display font-bold mb-2">{t("hero.countries", locale).replace("{count}", String(countries.length))}</h2>
  <p class="text-sm text-text-muted mb-6">{totalDevs.toLocaleString()} {t("ranking.developers", locale)}</p>

  <!-- Tabs -->
  <div class="flex gap-1 mb-6 overflow-x-auto pb-1">
    <button
      class="tab px-3 py-1.5 text-xs font-data rounded-md transition-all cursor-pointer
        {activeTab === 'All' ? 'active bg-accent text-white' : 'text-text-secondary border border-border hover:text-text'}"
      onclick={() => switchTab("All")}
    >{t("countryList.all", locale)} <span class="opacity-70">{countries.length}</span></button>
    {#each availableTabs as cont}
      <button
        class="tab px-3 py-1.5 text-xs font-data rounded-md transition-all cursor-pointer
          {activeTab === cont ? 'active bg-accent text-white' : 'text-text-secondary border border-border hover:text-text'}"
        onclick={() => switchTab(cont)}
      >{cont} <span class="opacity-70">{byContinent[cont]?.length ?? 0}</span></button>
    {/each}
  </div>

  <!-- Controls -->
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
    <div class="relative flex-1 max-w-xs">
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
        <SearchIcon />
      </span>
      <input
        type="text"
        placeholder={t("search.placeholder", locale)}
        bind:value={searchQuery}
        oninput={() => { if (searchQuery) trackEvent("country_list_search", { query: searchQuery }); }}
        class="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-text
          placeholder:text-text-muted font-body focus:outline-none focus:border-accent/40 transition-colors"
      />
    </div>
    <div class="flex items-center gap-2">
      <span class="text-xs text-text-muted">{t("ranking.sortBy", locale)}</span>
      <button
        class="px-3 py-1.5 text-xs font-data rounded-md transition-all cursor-pointer
          {sortKey === 'devs' ? 'bg-accent text-white' : 'text-text-secondary border border-border hover:text-text'}"
        onclick={() => setSort("devs")}
      >{t("ranking.sortByDevelopers", locale)}</button>
      <button
        class="px-3 py-1.5 text-xs font-data rounded-md transition-all cursor-pointer
          {sortKey === 'name' ? 'bg-accent text-white' : 'text-text-secondary border border-border hover:text-text'}"
        onclick={() => setSort("name")}
      >{t("ranking.name", locale)}</button>
    </div>
  </div>

  {#snippet countryGrid(items: CountrySummary[])}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {#each items as c (c.code)}
        {@const heat = calcHeat(c.devCount, maxDevs)}
        <Link
          href={buildCountryUrl(c.code, locale, basePath)}
          onclick={() => trackEvent("country_card_click", { country: c.name, code: c.code })}
          data-testid="country-card"
          class="group relative flex flex-col gap-3 px-4 py-4 rounded-xl border border-border
            hover:border-accent/40 hover:bg-surface-hover transition-all overflow-hidden"
        >
          <div
            class="absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r from-accent to-accent-hover transition-opacity"
            style="opacity: {0.2 + heat * 0.8}"
          ></div>
          <div class="flex items-center gap-3">
            <span class="text-2xl shrink-0">{c.flag}</span>
            <span class="font-display font-semibold truncate group-hover:text-accent transition-colors">{c.name}</span>
            <span class="ml-auto text-right shrink-0">
              <span class="text-sm font-data font-bold text-accent">{c.devCount.toLocaleString()}</span>
              <span class="text-[10px] text-text-muted ml-0.5">{t("countryList.developers", locale)}</span>
            </span>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex-1 h-2 bg-border/40 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-500"
                style="width: {maxContributions > 0 ? (c.totalContributions / maxContributions * 100) : 0}%"
              ></div>
            </div>
            <span class="text-xs text-text-muted font-data">{fmtNum(c.totalContributions)}</span>
          </div>
          {#if c.topContributors.length > 0}
            <div class="flex items-center">
              {#each c.topContributors as contributor}
                <img
                  src={contributor.avatarUrl}
                  alt={contributor.login}
                  data-testid="contributor-avatar"
                  width="24" height="24"
                  loading="lazy"
                  class="rounded-full border-2 border-surface -ml-1.5 first:ml-0"
                />
              {/each}
              {#if c.devCount > 3}
                <span class="w-6 h-6 rounded-full bg-border border-2 border-surface -ml-1.5 flex items-center justify-center text-[9px] font-data font-semibold text-text-muted">
                  +{c.devCount - c.topContributors.length}
                </span>
              {/if}
              <span class="ml-auto text-[11px] text-text-muted">{t("countryList.topContributors", locale)}</span>
            </div>
          {/if}
        </Link>
      {/each}
    </div>
  {/snippet}

  <!-- Grid -->
  {#if visibleByContinent}
    {#each CONTINENTS.filter(c => visibleByContinent[c]) as cont}
      <div class="mb-8">
        <div class="text-xs font-data text-text-muted tracking-widest uppercase mb-3 pb-2 border-b border-border">
          {t(CONT_KEYS[cont], locale)} <span class="text-text-muted/60">· {visibleByContinent[cont].length}</span>
        </div>
        {@render countryGrid(visibleByContinent[cont])}
      </div>
    {/each}
  {:else}
    {@render countryGrid(visibleCountries)}
  {/if}

  {#if visibleCountries.length === 0}
    <div class="text-center py-12 text-text-secondary">
      <div class="text-lg mb-2">{t("ranking.noResults", locale)}</div>
    </div>
  {/if}
</section>
