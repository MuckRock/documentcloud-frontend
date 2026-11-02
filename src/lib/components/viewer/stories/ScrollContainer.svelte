<!-- @component
Stands in for the scrolling element of DocumentLayout in viewer stories.

Must be a child of a ViewerContext.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { getViewerState } from "$lib/state/viewer.svelte";

  interface Props {
    height?: string;
    width?: string;
    children: Snippet;
  }

  let { height = "100vh", width = "100%", children }: Props = $props();

  const viewer = getViewerState();
</script>

<div class="scroll" style:height style:width bind:this={viewer.scrollContainer}>
  {@render children()}
</div>

<style>
  .scroll {
    overflow-y: auto;
    background: var(--gray-1);
  }
</style>
