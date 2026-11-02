<script lang="ts" generics="T">
  import {
    Virtualizer,
    type VirtualizerHandle,
    type VirtualizerProps,
  } from "virtua/svelte";
  import { getViewerState } from "$lib/state/viewer.svelte";
  import { onMount } from "svelte";

  let props: VirtualizerProps<T> = $props();

  const viewer = getViewerState();

  let virtualizer = $state<VirtualizerHandle>();

  onMount(() => {
    viewer.virtualizerRef = virtualizer;
    return () => (viewer.virtualizerRef = undefined);
  });
</script>

<Virtualizer bind:this={virtualizer} {...viewer.virtualizerProps} {...props} />
