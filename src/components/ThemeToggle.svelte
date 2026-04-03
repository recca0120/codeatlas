<script lang="ts">
  import SunIcon from "./icons/SunIcon.svelte";
  import MoonIcon from "./icons/MoonIcon.svelte";
  import { trackEvent } from "../lib/analytics";

  let isDark = $state(true);

  $effect(() => {
    isDark = document.documentElement.classList.contains("dark");
  });

  function toggle() {
    isDark = !isDark;
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
    trackEvent("theme_toggle", { theme: isDark ? "dark" : "light" });
  }
</script>

<button
  onclick={toggle}
  aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
  class="p-2 rounded-lg text-text-secondary hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
>
  {#if isDark}
    <SunIcon />
  {:else}
    <MoonIcon />
  {/if}
</button>
