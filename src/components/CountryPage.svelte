<script lang="ts">
  import { createHttpClient } from "../lib/http";
  import { CountryInfoSchema, CountryDataSchema, type CountryData } from "../lib/data-output";
  import { z } from "zod";
  import RankingFilter from "./RankingFilter.svelte";
  import ShareButtons from "./ShareButtons.svelte";
  import { t } from "../i18n";
  import { updateMeta } from "../lib/seo";
  import Link from "./Link.svelte";

  let { countryCode, basePath = "/", locale = "en" }: { countryCode: string; basePath?: string; locale?: string } = $props();

  let loading = $state(true);
  let error = $state("");
  let countryData = $state<CountryData | null>(null);
  let countryName = $state(countryCode);
  let countryFlag = $state("");

  $effect(() => {
    loadData();
  });

  async function loadData() {
    loading = true;
    error = "";
    try {
      const http = createHttpClient(basePath);
      const allCountries = z.array(CountryInfoSchema).parse(await http.get("data/countries.json").json());
      const config = allCountries.find(c => c.code === countryCode);
      if (config) {
        countryName = config.name || countryCode;
        countryFlag = config.flag || "";
      }

      countryData = CountryDataSchema.parse(await http.get(`data/${countryCode}.json`).json());
    } catch (e) {
      error = t("country.loadError", locale).replace("{code}", countryCode);
    }
    loading = false;
  }

  const users = $derived(countryData?.users ?? []);

  $effect(() => {
    if (countryData) {
      updateMeta({
        title: `${countryFlag} ${countryName} — CodeAtlas`,
        description: t("country.ogDescription", locale).replace("{country}", countryName).replace("{count}", String(users.length)),
      });
    }
  });
  const totalContrib = $derived(users.reduce((s, u) => s + u.publicContributions, 0));
  const updatedAt = $derived(countryData?.updatedAt ?? "");

  function fmt(n: number) { return n >= 1e6 ? (n/1e6).toFixed(1)+"M" : n >= 1e3 ? (n/1e3).toFixed(0)+"K" : String(n); }
</script>

{#if loading}
  <div class="max-w-5xl mx-auto px-6 sm:px-8 py-20 text-center text-text-muted">{t("country.loading", locale)}</div>
{:else if error}
  <div class="max-w-3xl mx-auto px-6 py-20 text-center">
    <h1 class="text-2xl font-display font-bold mb-4">{t("country.notFound", locale)}</h1>
    <p class="text-text-secondary">{error}</p>
    <Link href={basePath} class="text-accent hover:underline mt-4 inline-block">{t("country.backToHome", locale)}</Link>
  </div>
{:else}
  <div class="max-w-5xl mx-auto px-6 sm:px-8">
    <header class="pt-12 pb-10 border-b border-border">
      <div class="flex items-center gap-4">
        <span class="text-5xl">{countryFlag}</span>
        <div>
          <h1 class="text-3xl sm:text-4xl font-display font-bold tracking-tight">{countryName}</h1>
          <p class="text-text-secondary mt-1.5">
            <span class="font-data font-semibold text-text">{users.length.toLocaleString()}</span> {t("country.developers", locale)} ·
            <span class="font-data font-semibold text-text">{fmt(totalContrib)}</span> {t("country.contributions", locale)}
            {#if updatedAt}
              <span class="text-text-muted"> · {t("country.updated", locale)} {new Date(updatedAt).toLocaleDateString()}</span>
            {/if}
          </p>
        </div>
      </div>
    </header>

    <section class="py-10">
      <RankingFilter {users} {countryCode} {updatedAt} {locale} />
    </section>

    <footer class="py-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <span class="text-sm text-text-muted">{t("country.share", locale).replace("{name}", countryName)}</span>
      <ShareButtons url={window.location.href} text={t("country.topDevelopers", locale).replace("{name}", countryName)} {locale} />
    </footer>
  </div>
{/if}
