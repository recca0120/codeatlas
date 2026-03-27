<script lang="ts">
  interface Country {
    code: string;
    name: string;
    flag: string;
  }

  let { countries }: { countries: Country[] } = $props();

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
    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
    <input
      type="text"
      placeholder="Search countries..."
      bind:value={query}
      onfocus={() => focused = true}
      onblur={() => setTimeout(() => focused = false, 200)}
      class="w-full pl-9 pr-4 py-2.5 bg-surface border border-border/[0.06] rounded-lg text-sm text-text
        placeholder-ash font-body focus:outline-none focus:border-nova/40 transition-colors"
    />
  </div>

  {#if focused && filtered.length > 0}
    <div class="absolute z-50 top-full mt-1 left-0 right-0 bg-surface border border-border/[0.08] rounded-lg shadow-2xl overflow-hidden">
      {#each filtered as country}
        <a
          href="/{country.code}/"
          class="flex items-center gap-3 px-4 py-2.5 hover:bg-border/[0.04] transition-colors text-sm"
        >
          <span class="text-lg">{country.flag}</span>
          <span class="text-text">{country.name}</span>
        </a>
      {/each}
    </div>
  {/if}
</div>
