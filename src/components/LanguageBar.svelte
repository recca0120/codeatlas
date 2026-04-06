<script lang="ts">
  import { LANG_COLORS } from "../lib/language-colors";

  let { languages }: { languages: string[] } = $props();

  const counts = $derived.by(() => {
    const map = new Map<string, number>();
    for (const l of languages) map.set(l, (map.get(l) || 0) + 1);
    const total = languages.length || 1;
    return [...map.entries()]
      .map(([name, count]) => ({ name, pct: (count / total) * 100, color: LANG_COLORS[name] || "#666" }))
      .sort((a, b) => b.pct - a.pct);
  });
</script>

<div class="space-y-3">
  <!-- Stacked bar -->
  <div class="flex h-2.5 rounded-full overflow-hidden bg-border/[0.04]">
    {#each counts as lang}
      <div
        class="h-full transition-all duration-700 first:rounded-l-full last:rounded-r-full"
        style="width: {lang.pct}%; background: {lang.color}"
        title="{lang.name}: {Math.round(lang.pct)}%"
      ></div>
    {/each}
  </div>

  <!-- Legend -->
  <div class="flex flex-wrap gap-x-4 gap-y-1.5">
    {#each counts as lang}
      <div class="flex items-center gap-1.5 text-xs">
        <span class="w-2 h-2 rounded-full shrink-0" style="background: {lang.color}"></span>
        <span class="text-text-secondary">{lang.name}</span>
        <span class="font-data text-text-muted">{Math.round(lang.pct)}%</span>
      </div>
    {/each}
  </div>
</div>
