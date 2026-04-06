<script lang="ts">
  import { buildUrl } from "../lib/url";
  import { t } from "../i18n";
  import { buildLocalePrefix } from "../lib/locale-url";
  import Link from "./Link.svelte";

  let { basePath = "/", locale = "en" }: { basePath?: string; locale?: string } = $props();
</script>

<main class="max-w-3xl mx-auto px-4 sm:px-6 py-12">
  <Link href={buildUrl(buildLocalePrefix(locale), basePath)} class="text-xs font-data text-text-muted hover:text-accent transition-colors">{t("faq.backHome", locale)}</Link>

  <h1 class="text-3xl font-display font-bold mt-6 mb-8">{t("faq.heading", locale)}</h1>

  <div class="space-y-8">
    <section>
      <h2 class="text-lg font-display font-bold mb-2">{t("faq.q1", locale)}</h2>
      <p class="text-text-secondary leading-relaxed">{@html t("faq.a1", locale)}</p>
    </section>

    <section>
      <h2 class="text-lg font-display font-bold mb-2">{t("faq.q2", locale)}</h2>
      <p class="text-text-secondary leading-relaxed">{t("faq.a2.intro", locale)}</p>
      <ul class="list-disc list-inside text-text-secondary mt-2 space-y-1">
        <li>{@html t("faq.a2.public", locale)}</li>
        <li>{@html t("faq.a2.total", locale)}</li>
        <li>{@html t("faq.a2.followers", locale)}</li>
      </ul>
    </section>

    <section>
      <h2 class="text-lg font-display font-bold mb-2">{t("faq.q3", locale)}</h2>
      <p class="text-text-secondary leading-relaxed">{@html t("faq.a3", locale)}</p>
    </section>

    <section>
      <h2 class="text-lg font-display font-bold mb-2">{t("faq.q4", locale)}</h2>
      <p class="text-text-secondary leading-relaxed">{t("faq.a4.intro", locale)}</p>
      <ul class="list-disc list-inside text-text-secondary mt-2 space-y-1">
        <li>{t("faq.a4.r1", locale)}</li>
        <li>{t("faq.a4.r2", locale)}</li>
        <li>{t("faq.a4.r3", locale)}</li>
        <li>{t("faq.a4.r4", locale)}</li>
      </ul>
    </section>

    <section>
      <h2 class="text-lg font-display font-bold mb-2">{t("faq.q5", locale)}</h2>
      <p class="text-text-secondary leading-relaxed">{@html t("faq.a5", locale)}</p>
    </section>

    <section>
      <h2 class="text-lg font-display font-bold mb-2">{t("faq.q6", locale)}</h2>
      <p class="text-text-secondary leading-relaxed">{@html t("faq.a6", locale)}</p>
    </section>

    <section>
      <h2 class="text-lg font-display font-bold mb-2">{t("faq.q7", locale)}</h2>
      <p class="text-text-secondary leading-relaxed">{@html t("faq.a7", locale)}</p>
    </section>
  </div>

  <div class="mt-12 pt-8 border-t border-border text-xs font-data text-text-muted">
    <Link href={buildUrl(buildLocalePrefix(locale), basePath)} class="hover:text-accent transition-colors">{t("faq.backToCodeAtlas", locale)}</Link>
  </div>
</main>
