<script lang="ts">
  import type { ContributionWeek } from "../lib/three/contribution-terrain";

  let { weeks }: { weeks: ContributionWeek[] } = $props();

  const maxCount = $derived(
    Math.max(1, ...weeks.flatMap(w => w.contributionDays.map(d => d.count)))
  );

  function level(count: number): number {
    if (count === 0) return 0;
    const r = count / maxCount;
    if (r <= 0.25) return 1;
    if (r <= 0.5) return 2;
    if (r <= 0.75) return 3;
    return 4;
  }

  const LEVEL_COLORS = [
    "bg-border/[0.03]",
    "bg-[#0e4429]",
    "bg-[#006d32]",
    "bg-[#26a641]",
    "bg-[#39d353]",
  ];

  const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
  const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // Compute which months appear at which week index
  const monthMarkers = $derived.by(() => {
    const markers: { label: string; weekIdx: number }[] = [];
    let lastMonth = -1;
    for (let w = 0; w < weeks.length; w++) {
      const firstDay = weeks[w].contributionDays[0];
      if (!firstDay) continue;
      const month = new Date(firstDay.date).getMonth();
      if (month !== lastMonth) {
        markers.push({ label: MONTH_LABELS[month], weekIdx: w });
        lastMonth = month;
      }
    }
    return markers;
  });
</script>

<div class="overflow-x-auto" role="img" aria-label="Contribution activity heatmap">
  <!-- Month labels -->
  <div class="flex ml-8 mb-1 text-[9px] font-data text-text-muted select-none" style="gap: 0;">
    {#each monthMarkers as m}
      <span style="position: relative; left: {m.weekIdx * 13}px; width: 0; white-space: nowrap;">{m.label}</span>
    {/each}
  </div>

  <div class="flex gap-0.5">
    <!-- Day labels -->
    <div class="flex flex-col gap-0.5 pr-1.5 shrink-0">
      {#each DAY_LABELS as label}
        <div class="h-[11px] text-[9px] font-data text-text-muted leading-[11px] text-right w-6 select-none">{label}</div>
      {/each}
    </div>

    <!-- Grid -->
    {#each weeks as week, wi}
      <div class="flex flex-col gap-0.5">
        {#each week.contributionDays as day}
          <div
            class="w-[11px] h-[11px] rounded-[2px] {LEVEL_COLORS[level(day.count)]} transition-colors duration-200 hover:ring-1 hover:ring-white/30"
            title="{day.date}: {day.count} contributions"
          ></div>
        {/each}
      </div>
    {/each}
  </div>

  <!-- Legend -->
  <div class="flex items-center gap-1 mt-2 ml-8 text-[9px] font-data text-text-muted select-none">
    <span>Less</span>
    {#each LEVEL_COLORS as color}
      <div class="w-[11px] h-[11px] rounded-[2px] {color}"></div>
    {/each}
    <span>More</span>
  </div>
</div>
