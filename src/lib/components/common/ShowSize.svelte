<script lang="ts">
  import type { Snippet } from "svelte";

  import { MAX_EDIT_BATCH } from "@/config/config.js";

  interface Props {
    size: number;
    limit?: number;
    children?: Snippet;
    oversize?: Snippet;
    empty?: Snippet;
  }

  let {
    size,
    limit = MAX_EDIT_BATCH,
    children,
    oversize,
    empty,
  }: Props = $props();
</script>

{#if size >= 1 && size <= limit}
  <!-- Size is good, show default slot -->
  {@render children?.()}
{:else if size > limit}
  <!-- Size is over the limit -->
  {@render oversize?.()}
{:else}
  <!-- Size is empty -->
  {@render empty?.()}
{/if}
