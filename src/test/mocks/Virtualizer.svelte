<script lang="ts" generics="T">
  // Stand-in for virtua's Virtualizer in unit tests. jsdom has no layout engine,
  // so the real Virtualizer measures a 0px viewport and mounts no items.
  // This renders every item so tests can query the full list.
  import type { Snippet } from "svelte";

  interface Props {
    data: T[];
    children: Snippet<[T, number]>;
    [key: string]: unknown;
  }

  let { data, children }: Props = $props();
</script>

{#each data as item, index}
  {@render children(item, index)}
{/each}
