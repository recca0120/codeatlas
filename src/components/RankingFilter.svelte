<script lang="ts">
  import type { GitHubUser } from "../lib/github-client";
  import { buildRankMap, getRankValue, rankUsers, type RankingDimension } from "../lib/ranking";
  import { t } from "../i18n";
  import SearchIcon from "./icons/SearchIcon.svelte";
  import Link from "./Link.svelte";
  import { trackEvent } from "../lib/analytics";

  let {
    users,
    countryCode = "",
    updatedAt = "",
    locale = "en",
  }: {
    users: GitHubUser[];
    countryCode?: string;
    updatedAt?: string;
    locale?: string;
  } = $props();

  let search = $state("");
  let langFilter = $state<string[]>([]);
  let cityFilter = $state("");
  let dimension = $state<RankingDimension>("public_contributions");
  $effect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    if (p.get("q")) search = p.get("q")!;
    if (p.get("lang")) langFilter = p.get("lang")!.split(",");
    if (p.get("city")) cityFilter = p.get("city")!;
    if (p.get("sort")) dimension = p.get("sort") as RankingDimension;
  });

  function sync() {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams();
    if (search) p.set("q", search);
    if (langFilter.length) p.set("lang", langFilter.join(","));
    if (cityFilter) p.set("city", cityFilter);
    if (dimension !== "public_contributions") p.set("sort", dimension);
    const qs = p.toString();
    history.replaceState({}, "", qs ? `?${qs}` : location.pathname);
  }

  const rankedUsers = $derived(rankUsers(users, dimension));
  const rankMap = $derived(buildRankMap(rankedUsers));
  const allLangs = $derived.by(() => {
    const counts = new Map<string, number>();
    for (const u of users) for (const l of u.languages) counts.set(l, (counts.get(l) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([l]) => l);
  });

  function normalizeCity(city: string): string {
    return city.trim().replace(/\s+/g, " ").replace(/[.,]+$/, "");
  }

  const cityMap = $derived.by(() => {
    const map = new Map<string, string>();
    for (const u of users) {
      if (!u.location) continue;
      const key = normalizeCity(u.location).toLowerCase();
      if (!map.has(key)) map.set(key, normalizeCity(u.location));
    }
    return map;
  });
  const allCities = $derived([...new Set(cityMap.values())].sort());

  const filtered = $derived.by(() => {
    let list = [...rankedUsers];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u => u.login.toLowerCase().includes(q) || (u.name?.toLowerCase().includes(q) ?? false));
    }
    if (langFilter.length) list = list.filter(u => langFilter.some(l => u.languages.includes(l)));
    if (cityFilter) {
      const cityKey = normalizeCity(cityFilter).toLowerCase();
      list = list.filter(u => u.location && normalizeCity(u.location).toLowerCase() === cityKey);
    }
    return list;
  });

  const hasFilters = $derived(search !== "" || langFilter.length > 0 || cityFilter !== "");


  function toggleLang(lang: string) {
    const active = !langFilter.includes(lang);
    langFilter = active ? [...langFilter, lang] : langFilter.filter(l => l !== lang);
    trackEvent("language_filter", { language: lang, action: active ? "add" : "remove", country: countryCode });
    sync();
  }
  function clearAll() { search = ""; langFilter = []; cityFilter = ""; sync(); }
  function setDim(d: RankingDimension) {
    trackEvent("ranking_tab_switch", { dimension: d, country: countryCode });
    dimension = d; sync();
  }

  import { LANG_COLORS } from "../lib/language-colors";

  const MAX_LANG_CHIPS = 12;
</script>

<!-- RankingDimension tabs -->
<div class="flex flex-wrap items-center gap-2 mb-4">
  {#each [["public_contributions",t("ranking.public", locale)],["total_contributions",t("ranking.total", locale)],["followers",t("ranking.followers", locale)]] as [key, label]}
    <button
      class="px-3 py-1.5 text-xs font-data rounded-md transition-all cursor-pointer
        {dimension === key ? 'bg-accent text-white' : 'text-text-secondary border border-border hover:text-text'}"
      onclick={() => setDim(key as RankingDimension)}
    >{label}</button>
  {/each}
</div>

<!-- Search + city -->
<div class="flex flex-col sm:flex-row gap-2 mb-3">
  <div class="relative flex-1">
    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
      <SearchIcon />
    </span>
    <input type="text" placeholder={t("ranking.searchDeveloper", locale)} bind:value={search}
      oninput={() => { sync(); }}
      onblur={() => { if (search) trackEvent("developer_search", { query: search, country: countryCode }); }}
      class="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm placeholder-text-muted
        focus:outline-none focus:border-accent transition-colors" />
  </div>
  {#if allCities.length > 1}
    <select bind:value={cityFilter} onchange={() => { if (cityFilter) trackEvent("city_filter", { city: cityFilter, country: countryCode }); sync(); }}
      aria-label={t("ranking.allCities", locale)}
      class="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary focus:outline-none cursor-pointer">
      <option value="">{t("ranking.allCities", locale)}</option>
      {#each allCities as city}<option value={city}>{city}</option>{/each}
    </select>
  {/if}
</div>

<!-- Language chips -->
<div class="flex flex-wrap gap-1.5 mb-3">
  {#each allLangs.slice(0, MAX_LANG_CHIPS) as lang}
    <button
      class="px-2 py-1 text-xs font-data rounded transition-all cursor-pointer
        {langFilter.includes(lang) ? 'ring-1 ring-accent text-accent bg-accent/10' : 'text-text-secondary bg-surface border border-border'}"
      onclick={() => toggleLang(lang)}
    >{lang}</button>
  {/each}
</div>

<!-- Active filters -->
{#if hasFilters}
  <div class="flex flex-wrap items-center gap-2 mb-3">
    {#if search}
      <span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-data bg-accent/10 text-accent rounded">
        "{search}" <button onclick={() => { search = ""; sync(); }} class="hover:text-text cursor-pointer">×</button>
      </span>
    {/if}
    {#each langFilter as lang}
      <span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-data bg-accent/10 text-accent rounded">
        {lang} <button onclick={() => toggleLang(lang)} class="hover:text-text cursor-pointer">×</button>
      </span>
    {/each}
    {#if cityFilter}
      <span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-data bg-accent/10 text-accent rounded">
        {cityFilter} <button onclick={() => { cityFilter = ""; sync(); }} class="hover:text-text cursor-pointer">×</button>
      </span>
    {/if}
    <button onclick={clearAll} class="text-xs font-data text-text-muted hover:text-danger cursor-pointer">{t("ranking.clearAll", locale)}</button>
  </div>
{/if}

<div class="text-xs text-text-muted mb-4">
  <span>{filtered.length} {t("ranking.of", locale)} {users.length} {t("ranking.developers", locale)}</span>
</div>

<!-- Ranking rows -->
<div class="divide-y divide-border">
  {#each filtered as user, i (user.login)}
    {@const rank = rankMap.get(user.login) ?? i + 1}
    {@const val = getRankValue(user, dimension)}
    {@const isTop3 = rank <= 3}

    <Link href="{user.login}"
      onclick={() => trackEvent("developer_click", { login: user.login, rank, country: countryCode })}
      class="group flex items-center gap-4 px-2 sm:px-4 transition-colors hover:bg-surface-hover
        {isTop3 ? 'py-5' : 'py-3.5'}">

      <span class="font-data font-bold shrink-0 w-12 text-right
        {isTop3 ? 'text-xl' : 'text-base'}
        {rank === 1 ? 'text-gold' : rank === 2 ? 'text-silver' : rank === 3 ? 'text-bronze' : 'text-text-muted'}
        group-hover:text-accent transition-colors">{rank}</span>

      <img src={user.avatarUrl} alt="" class="rounded-full shrink-0"
        width={isTop3 ? 48 : 36} height={isTop3 ? 48 : 36} loading="lazy" />

      <div class="flex-1 min-w-0">
        <span class="font-display font-semibold truncate block
          {isTop3 ? 'text-lg' : 'text-base'}">{user.name || user.login}</span>
        {#if user.location}
          <span class="text-sm text-text-muted">{user.location}</span>
        {/if}
      </div>

      <div class="hidden sm:flex items-center gap-1.5 shrink-0">
        {#each user.languages.slice(0, 3) as lang}
          <span class="px-2 py-0.5 text-xs font-data rounded"
            style="background:{LANG_COLORS[lang]||'#555'}25;color:{LANG_COLORS[lang]||'#999'}">{lang}</span>
        {/each}
      </div>

      <span class="font-data font-bold shrink-0 w-28 text-right
        {isTop3 ? 'text-lg' : 'text-base'}">{val.toLocaleString()}</span>
    </Link>
  {/each}
</div>

{#if filtered.length === 0}
  <div class="text-center py-16 text-text-secondary">
    <div class="text-2xl mb-2">{t("ranking.noResults", locale)}</div>
    <button onclick={clearAll} class="text-sm text-accent hover:underline cursor-pointer">{t("ranking.clearFilters", locale)}</button>
  </div>
{/if}

