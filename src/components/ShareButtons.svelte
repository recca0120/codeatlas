<script lang="ts">
  import { t } from "../i18n";

  let { url, text, locale = "en" }: { url: string; text: string; locale?: string } = $props();
  let copied = $state(false);

  const encodedUrl = $derived(encodeURIComponent(url));
  const encodedText = $derived(encodeURIComponent(text));

  const platforms = $derived([
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: "Twitter", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}` },
    { name: "Threads", href: `https://www.threads.net/intent/post?text=${encodedText}%20${encodedUrl}` },
    { name: "WhatsApp", href: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
    { name: "Telegram", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
  ]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      copied = true;
      setTimeout(() => copied = false, 2000);
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      copied = true;
      setTimeout(() => copied = false, 2000);
    }
  }
</script>

<div class="flex flex-wrap items-center gap-2">
  {#each platforms as p}
    <a
      href={p.href}
      target="_blank"
      rel="noopener noreferrer"
      class="px-3 py-1.5 text-xs font-data tracking-wider text-text-secondary
        border border-border rounded-md hover:text-accent hover:border-accent/30 transition-all"
    >
      {p.name.toUpperCase()}
    </a>
  {/each}
  <button
    onclick={copyLink}
    class="px-3 py-1.5 text-xs font-data tracking-wider border border-border rounded-md transition-all
      {copied ? 'text-success border-success/30 bg-success/5' : 'text-text-secondary hover:text-accent hover:border-accent/30'}"
  >
    {copied ? t("share.copied", locale) : t("share.copyLink", locale)}
  </button>
</div>
