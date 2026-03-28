<script lang="ts">
  import Link from "./Link.svelte";
  let { href = "/", label = "" }: { href?: string; label?: string } = $props();
</script>

<Link {href}>{label}</Link>
