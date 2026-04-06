<script lang="ts">
  import { onMount } from "svelte";
  import { buildUrl } from "../lib/url";
  import { t } from "../i18n";
  import type { GitHubUser } from "../lib/github-client";
  import { loadCountryData } from "../lib/data-loader";
  import { toastZodError } from "../lib/toast";
  import { rankUsers } from "../lib/ranking";
  import LanguageBar from "./LanguageBar.svelte";
  import { updateMeta } from "../lib/seo";
  import ShareButtons from "./ShareButtons.svelte";
  import Link from "./Link.svelte";
  import { trackEvent } from "../lib/analytics";
  import { buildCountryUrl } from "../lib/locale-url";

  let { countryCode, userName, basePath = "/", locale = "en" }: { countryCode: string; userName: string; basePath?: string; locale?: string } = $props();

  let loading = $state(true);
  let error = $state("");
  let user = $state<GitHubUser | null>(null);
  let rank = $state(0);
  let countryName = $state(countryCode);
  let countryFlag = $state("");

  import { LANG_COLORS as LC } from "../lib/language-colors";

  onMount(() => { loadData(); });

  async function loadData() {
    loading = true;
    error = "";
    try {
      const result = await loadCountryData(countryCode, basePath);
      countryName = result.countryName;
      countryFlag = result.countryFlag;
      const data = result.countryData;
      const ranked = rankUsers(data.users, "public_contributions");
      const idx = ranked.findIndex(u => u.login === userName);
      if (idx === -1) { error = t("profile.userNotFound", locale).replace("{name}", userName).replace("{country}", countryName); loading = false; return; }
      user = ranked[idx];
      rank = idx + 1;
      updateMeta({
        title: `${user.name || user.login} — #${rank} in ${countryName} — CodeAtlas`,
        description: t("profile.ogDescription", locale).replace("{name}", user.name || user.login).replace("{rank}", String(rank)).replace("{country}", countryName),
      });
      trackEvent("profile_view", { login: user.login, rank, country: countryCode });
    } catch (e) {
      console.error(`Failed to load profile for ${userName}:`, e);
      error = t("profile.loadError", locale).replace("{name}", userName);
      toastZodError(e);
    }
    loading = false;
  }
</script>

{#if loading}
  <div class="max-w-3xl mx-auto px-6 py-20 text-center text-text-muted">{t("profile.loading", locale)}</div>
{:else if error || !user}
  <div class="max-w-3xl mx-auto px-6 py-20 text-center">
    <h1 class="text-2xl font-display font-bold mb-4">{t("profile.notFound", locale)}</h1>
    <p class="text-text-secondary">{error}</p>
    <Link href={buildCountryUrl(countryCode, locale, basePath)} class="text-accent hover:underline mt-4 inline-block">{t("profile.backTo", locale).replace("{name}", countryName)}</Link>
  </div>
{:else}
  {@const u = user}
  <div class="max-w-3xl mx-auto px-6 sm:px-8 py-12">
    <Link href={buildCountryUrl(countryCode, locale, basePath)} class="text-xs font-data text-text-muted hover:text-accent transition-colors">{t("profile.backTo", locale).replace("{name}", countryName)}</Link>

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
            onclick={() => trackEvent("external_link_click", { type: "github", login: u.login })}
            class="px-3 py-1.5 text-sm border border-border rounded-lg hover:text-accent hover:border-accent/50 transition-colors">{t("profile.github", locale)}</a>
          {#if u.twitterUsername}
            <a href={`https://twitter.com/${u.twitterUsername}`} target="_blank" rel="noopener"
              onclick={() => trackEvent("external_link_click", { type: "twitter", login: u.login })}
              class="px-3 py-1.5 text-sm border border-border rounded-lg hover:text-accent hover:border-accent/50 transition-colors">𝕏 {u.twitterUsername}</a>
          {/if}
          {#if u.blog}
            <a href={u.blog} target="_blank" rel="noopener"
              onclick={() => trackEvent("external_link_click", { type: "blog", login: u.login })}
              class="px-3 py-1.5 text-sm border border-border rounded-lg hover:text-accent hover:border-accent/50 transition-colors">{t("profile.blog", locale)}</a>
          {/if}
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 border border-border rounded-xl overflow-hidden mb-12">
      {#each [
        { v: `#${rank}`, l: countryName },
        { v: u.publicContributions.toLocaleString(), l: t("profile.contributions", locale) },
        { v: u.followers.toLocaleString(), l: t("profile.followers", locale) },
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
        <h2 class="text-xs font-data text-text-muted tracking-widest uppercase mb-3">{t("profile.languages", locale)}</h2>
        <LanguageBar languages={u.languages} />
      </div>
    {/if}

    <!-- Repos -->
    {#if u.topRepos.length > 0}
      <div class="mb-12">
        <h2 class="text-xs font-data text-text-muted tracking-widest uppercase mb-3">{t("profile.topRepos", locale)}</h2>
        <div class="border border-border rounded-xl overflow-hidden divide-y divide-border">
          {#each u.topRepos as repo}
            <a
              href={`https://github.com/${u.login}/${repo.name}`}
              target="_blank"
              rel="noopener"
              onclick={() => trackEvent("repo_click", { login: u.login, repo: repo.name })}
              class="flex items-center gap-4 px-5 py-4 hover:bg-surface-hover transition-colors"
            >
              <div class="flex-1 min-w-0">
                <div class="font-display font-semibold">{repo.name}</div>
                {#if repo.description}<div class="text-sm text-text-secondary mt-0.5">{repo.description}</div>{/if}
              </div>
              {#if repo.language}
                <span class="px-2 py-0.5 text-xs font-data rounded shrink-0"
                  style="background:{LC[repo.language]||'#555'}20;color:{LC[repo.language]||'#999'}">{repo.language}</span>
              {/if}
              <span class="font-data text-sm text-gold shrink-0">★ {repo.stars.toLocaleString()}</span>
            </a>
          {/each}
        </div>
      </div>
    {/if}

    <!-- GitHub link -->
    <a href={`https://github.com/${u.login}`} target="_blank" rel="noopener"
      onclick={() => trackEvent("external_link_click", { type: "github", login: u.login })}
      class="flex items-center gap-2 px-5 py-4 border border-border rounded-xl hover:bg-surface-hover transition-colors mb-12">
      <span>{t("profile.viewOnGithub", locale)}</span>
      <span class="ml-auto text-text-muted">→</span>
    </a>

    <!-- Share -->
    <div class="pt-8 border-t border-border">
      <div class="text-xs text-text-muted tracking-widest uppercase mb-3">{t("profile.shareProfile", locale)}</div>
      <ShareButtons url={window.location.href} text={t("profile.shareText", locale).replace("{name}", u.name || u.login).replace("{rank}", String(rank)).replace("{country}", countryName)} {locale} />
    </div>
  </div>
{/if}
