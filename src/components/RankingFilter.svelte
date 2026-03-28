<script lang="ts">
  import type { GitHubUser } from "../lib/github-client";
  import { buildRankMap, getRankValue, rankUsers, type RankingRankingDimension } from "../lib/ranking";
  import { t } from "../i18n";

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
  let page = $state(1);
  const PER_PAGE = 50;

  $effect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    if (p.get("q")) search = p.get("q")!;
    if (p.get("lang")) langFilter = p.get("lang")!.split(",");
    if (p.get("city")) cityFilter = p.get("city")!;
    if (p.get("sort")) dimension = p.get("sort") as RankingDimension;
    if (p.get("page")) page = Number(p.get("page"));
  });

  function sync() {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams();
    if (search) p.set("q", search);
    if (langFilter.length) p.set("lang", langFilter.join(","));
    if (cityFilter) p.set("city", cityFilter);
    if (dimension !== "public_contributions") p.set("sort", dimension);
    if (page > 1) p.set("page", String(page));
    const qs = p.toString();
    history.replaceState({}, "", qs ? `?${qs}` : location.pathname);
  }

  const rankedUsers = $derived(rankUsers(users, dimension));
  const rankMap = $derived(buildRankMap(rankedUsers));
  const allLangs = $derived([...new Set(users.flatMap(u => u.languages))].sort());
  const allCities = $derived([...new Set(users.map(u => u.location).filter(Boolean))].sort() as string[]);

  const filtered = $derived.by(() => {
    let list = [...rankedUsers];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u => u.login.toLowerCase().includes(q) || (u.name?.toLowerCase().includes(q) ?? false));
    }
    if (langFilter.length) list = list.filter(u => langFilter.some(l => u.languages.includes(l)));
    if (cityFilter) list = list.filter(u => u.location === cityFilter);
    return list;
  });

  const totalPages = $derived(Math.ceil(filtered.length / PER_PAGE));
  const paged = $derived(filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE));
  const hasFilters = $derived(search !== "" || langFilter.length > 0 || cityFilter !== "");


  function toggleLang(lang: string) {
    langFilter = langFilter.includes(lang) ? langFilter.filter(l => l !== lang) : [...langFilter, lang];
    page = 1; sync();
  }
  function clearAll() { search = ""; langFilter = []; cityFilter = ""; page = 1; sync(); }
  function setDim(d: RankingDimension) { dimension = d; page = 1; sync(); }
  function setPage(p: number) { page = p; sync(); }

  const LANG_COLORS: Record<string, string> = {
    TypeScript:"#3178c6",JavaScript:"#f1e05a",Python:"#3572a5",Go:"#00add8",Rust:"#dea584",
    Java:"#b07219","C++":"#f34b7d",Ruby:"#701516",PHP:"#4f5d95",Swift:"#f05138",Kotlin:"#a97bff",Dart:"#00b4ab",
  };
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
    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
    <input type="text" placeholder={t("ranking.searchDeveloper", locale)} bind:value={search}
      oninput={() => { page = 1; sync(); }}
      class="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm placeholder-text-muted
        focus:outline-none focus:border-accent transition-colors" />
  </div>
  {#if allCities.length > 1}
    <select bind:value={cityFilter} onchange={() => { page = 1; sync(); }}
      class="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary focus:outline-none cursor-pointer">
      <option value="">{t("ranking.allCities", locale)}</option>
      {#each allCities as city}<option value={city}>{city}</option>{/each}
    </select>
  {/if}
</div>

<!-- Language chips -->
<div class="flex flex-wrap gap-1.5 mb-3">
  {#each allLangs.slice(0, 12) as lang}
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

<div class="text-xs text-text-muted mb-4">{filtered.length} {t("ranking.of", locale)} {users.length} {t("ranking.developers", locale)}</div>

<!-- Ranking rows -->
<div class="divide-y divide-border">
  {#each paged as user, i (user.login)}
    {@const rank = rankMap.get(user.login) ?? (page - 1) * PER_PAGE + i + 1}
    {@const val = getRankValue(user, dimension)}
    {@const isTop3 = rank <= 3}

    <a href="{user.login}"
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
            style="background:{LANG_COLORS[lang]||'#555'}20;color:{LANG_COLORS[lang]||'#999'}">{lang}</span>
        {/each}
      </div>

      <span class="font-data font-bold shrink-0 w-28 text-right
        {isTop3 ? 'text-lg' : 'text-base'}">{val.toLocaleString()}</span>
    </a>
  {/each}
</div>

{#if filtered.length === 0}
  <div class="text-center py-16 text-text-secondary">
    <div class="text-2xl mb-2">{t("ranking.noResults", locale)}</div>
    <button onclick={clearAll} class="text-sm text-accent hover:underline cursor-pointer">{t("ranking.clearFilters", locale)}</button>
  </div>
{/if}

<!-- Pagination -->
{#if totalPages > 1}
  <div class="flex items-center justify-center gap-1 mt-8">
    <button disabled={page <= 1} onclick={() => setPage(page - 1)}
      class="px-3 py-1.5 text-xs font-data border border-border rounded text-text-secondary hover:text-text disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed">←</button>
    {#each Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
      if (totalPages <= 7) return i + 1;
      if (page <= 4) return i + 1;
      if (page >= totalPages - 3) return totalPages - 6 + i;
      return page - 3 + i;
    }) as p}
      <button onclick={() => setPage(p)}
        class="w-8 h-8 text-xs font-data rounded cursor-pointer {p === page ? 'bg-accent text-white' : 'text-text-secondary hover:bg-surface-hover'}">{p}</button>
    {/each}
    <button disabled={page >= totalPages} onclick={() => setPage(page + 1)}
      class="px-3 py-1.5 text-xs font-data border border-border rounded text-text-secondary hover:text-text disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed">→</button>
  </div>
{/if}
