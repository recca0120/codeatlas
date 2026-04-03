<script lang="ts">
  import type { Snippet } from "svelte";
  import { navigate } from "../lib/router";

  let { href, class: className = "", children, onclick: onclickProp, ...rest }: { href: string; class?: string; children: Snippet; onclick?: (e: MouseEvent) => void; [key: string]: unknown } = $props();

  function handleClick(e: MouseEvent) {
    onclickProp?.(e);
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    navigate(href);
  }
</script>

<a {href} class={className} onclick={handleClick} {...rest}>
  {@render children()}
</a>
