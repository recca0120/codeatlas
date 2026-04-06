<script lang="ts">
  import type { Snippet } from "svelte";
  import { navigate, isModifiedClick } from "../lib/router";

  let { href, class: className = "", children, onclick: onclickProp, ...rest }: { href: string; class?: string; children: Snippet; onclick?: (e: MouseEvent) => void; [key: string]: unknown } = $props();

  function handleClick(e: MouseEvent) {
    onclickProp?.(e);
    if (isModifiedClick(e)) return;
    e.preventDefault();
    navigate(href);
  }
</script>

<a {href} class={className} onclick={handleClick} {...rest}>
  {@render children()}
</a>
