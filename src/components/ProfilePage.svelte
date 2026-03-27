<script lang="ts">
  import ky from "ky";
  import type { GitHubUser } from "../lib/github-client";
  import type { CountryData } from "../lib/data-output";
  import LanguageBar from "./LanguageBar.svelte";
  import ShareButtons from "./ShareButtons.svelte";

  let { countryCode, userName, basePath = "/" }: { countryCode: string; userName: string; basePath?: string } = $props();

  let loading = $state(true);
  let error = $state("");
  let user = $state<GitHubUser | null>(null);
  let rank = $state(0);
  let countryName = $state(countryCode);
  let countryFlag = $state("");

  const LC: Record<string, string> = {
    TypeScript:"#3178c6",JavaScript:"#f1e05a",Python:"#3572a5",Go:"#00add8",Rust:"#dea584",
    Java:"#b07219","C++":"#f34b7d",Ruby:"#701516",PHP:"#4f5d95",Swift:"#f05138",Kotlin:"#a97bff",Dart:"#00b4ab"
  };

  $effect(() => { loadData(); });

  async function loadData() {
    loading = true;
    error = "";
    try {
      const allCountries = await ky.get(`${basePath}data/countries.json`).json<any[]>();
      const config = allCountries.find((c: any) => c.code === countryCode);
      if (config) { countryName = config.name; countryFlag = config.flag || ""; }

      const data = await ky.get(`${basePath}data/${countryCode}.json`).json<CountryData>();
      const users = data.rankings.public_contributions;
      const idx = users.findIndex(u => u.login === userName);
      if (idx === -1) { error = `User "${userName}" not found in ${countryName}`; loading = false; return; }
      user = users[idx];
      rank = idx + 1;
    } catch {
      error = `Could not load data for "${userName}"`;
    }
    loading = false;
  }
</script>

{#if loading}
  <div class="max-w-3xl mx-auto px-6 py-20 text-center text-text-muted">Loading...</div>
{:else if error || !user}
  <div class="max-w-3xl mx-auto px-6 py-20 text-center">
    <h1 class="text-2xl font-display font-bold mb-4">Not found</h1>
    <p class="text-text-secondary">{error}</p>
    <a href={`${basePath}${countryCode}/`} class="text-accent hover:underline mt-4 inline-block">← Back to {countryName}</a>
  </div>
{:else}
  {@const u = user}
  <div class="max-w-3xl mx-auto px-6 sm:px-8 py-12">

    <!-- Profile -->
    <div class="flex flex-col sm:flex-row gap-6 mb-12">
      <img src={u.avatarUrl} alt={u.login} width="96" height="96" class="rounded-2xl ring-1 ring-border shrink-0" />
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-4">
          <h1 class="text-2xl sm:text-3xl font-display font-bold tracking-tight">{u.name || u.login}</h1>
          <span class="font-data font-bold text-xl text-accent shrink-0">#{rank}</span>
        </div>
        <p class="text-text-secondary mt-1">
          @{u.login}{u.location ? ` · ${u.location}` : ""}{u.company ? ` · ${u.company}` : ""}
        </p>
        {#if u.bio}<p class="text-text-secondary mt-3">{u.bio}</p>{/if}
        <div class="flex flex-wrap gap-2 mt-4">
          <a href={`https://github.com/${u.login}`} target="_blank" rel="noopener"
            class="px-3 py-1.5 text-sm border border-border rounded-lg hover:text-accent hover:border-accent/50 transition-colors">GitHub</a>
          {#if u.twitterUsername}
            <a href={`https://twitter.com/${u.twitterUsername}`} target="_blank" rel="noopener"
              class="px-3 py-1.5 text-sm border border-border rounded-lg hover:text-accent hover:border-accent/50 transition-colors">𝕏 {u.twitterUsername}</a>
          {/if}
          {#if u.blog}
            <a href={u.blog} target="_blank" rel="noopener"
              class="px-3 py-1.5 text-sm border border-border rounded-lg hover:text-accent hover:border-accent/50 transition-colors">Blog</a>
          {/if}
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 border border-border rounded-xl overflow-hidden mb-12">
      {#each [
        { v: `#${rank}`, l: countryName },
        { v: u.publicContributions.toLocaleString(), l: "Contributions" },
        { v: u.followers.toLocaleString(), l: "Followers" },
      ] as stat, i}
        <div class={`px-5 py-6 text-center ${i < 2 ? 'border-r border-border' : ''}`}>
          <div class="font-data font-bold text-2xl">{stat.v}</div>
          <div class="text-xs text-text-muted mt-1">{stat.l}</div>
        </div>
      {/each}
    </div>

    <!-- Languages -->
    {#if u.languages.length > 0}
      <div class="mb-12">
        <h2 class="text-xs font-data text-text-muted tracking-widest uppercase mb-3">Languages</h2>
        <LanguageBar languages={u.languages} />
      </div>
    {/if}

    <!-- Repos -->
    {#if u.topRepos.length > 0}
      <div class="mb-12">
        <h2 class="text-xs font-data text-text-muted tracking-widest uppercase mb-3">Top Repositories</h2>
        <div class="border border-border rounded-xl overflow-hidden divide-y divide-border">
          {#each u.topRepos as repo}
            <div class="flex items-center gap-4 px-5 py-4">
              <div class="flex-1 min-w-0">
                <div class="font-display font-semibold">{repo.name}</div>
                {#if repo.description}<div class="text-sm text-text-secondary mt-0.5">{repo.description}</div>{/if}
              </div>
              {#if repo.language}
                <span class="px-2 py-0.5 text-xs font-data rounded shrink-0"
                  style="background:{LC[repo.language]||'#555'}20;color:{LC[repo.language]||'#999'}">{repo.language}</span>
              {/if}
              <span class="font-data text-sm text-gold shrink-0">★ {repo.stars.toLocaleString()}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- GitHub link -->
    <a href={`https://github.com/${u.login}`} target="_blank" rel="noopener"
      class="flex items-center gap-2 px-5 py-4 border border-border rounded-xl hover:bg-surface-hover transition-colors mb-12">
      <span>View full profile on GitHub</span>
      <span class="ml-auto text-text-muted">→</span>
    </a>

    <!-- Share -->
    <div class="pt-8 border-t border-border">
      <div class="text-xs text-text-muted tracking-widest uppercase mb-3">Share profile</div>
      <ShareButtons url={window.location.href} text={`${u.name || u.login} is #${rank} in ${countryName} on CodeAtlas!`} />
    </div>
  </div>
{/if}
