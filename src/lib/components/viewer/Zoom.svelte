<!-- @component
Shared zoom component for all viewer routes.

Must be a child of a ViewerContext
-->
<script lang="ts">
  import { page } from "$app/state";
  import { _ } from "svelte-i18n";

  import {
    getDefaultZoom,
    getZoomLevels,
    getInitialZoom,
    getZoomInOut,
  } from "$lib/utils/viewer";
  import { getViewerState } from "$lib/state/viewer.svelte";

  import Button from "$lib/components/common/Button.svelte";
  import { ZoomIn16, ZoomOut16 } from "svelte-octicons";

  const viewer = getViewerState();

  let zoomLevels = $derived(getZoomLevels(viewer.mode));
  let initial = $derived(getInitialZoom(page.url, viewer.mode));

  let [zoomOut, zoomIn] = $derived(
    getZoomInOut(viewer.mode, viewer.zoom, viewer.autoZoomScale),
  );

  $effect(() => {
    viewer.zoom = initial || getDefaultZoom(viewer.mode);
  });
</script>

<div class="zoom">
  {#if zoomLevels.length}
    <Button
      mode="primary"
      size="small"
      ghost
      minW={false}
      aria-label={$_("zoom.zoomOut")}
      disabled={zoomOut === null}
      onclick={() => (viewer.zoom = zoomOut!)}
    >
      <ZoomOut16 />
    </Button>
    <Button
      mode="primary"
      size="small"
      ghost
      minW={false}
      aria-label={$_("zoom.zoomIn")}
      disabled={zoomIn === null}
      onclick={() => (viewer.zoom = zoomIn!)}
    >
      <ZoomIn16 />
    </Button>
    <label>
      <span class="sr-only">
        {#if viewer.mode === "grid"}
          {$_("zoom.size")}
        {:else}
          {$_("zoom.zoom")}
        {/if}
      </span>
      <select name="zoom" bind:value={viewer.zoom}>
        {#each zoomLevels as [value, label]}
          <option {value}>
            {$_(label)}
            {#if value === "auto"}
              ({Math.round(viewer.autoZoomScale * 100)}%)
            {/if}
          </option>
        {/each}
      </select>
    </label>
  {/if}
</div>

<style>
  .zoom {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: end;
  }

  select {
    padding: 0.125em 0.25rem;
    border: 1px solid var(--gray-2);
    border-radius: 0.5rem;
    font-family: var(--font-sans);
    font-size: var(--font-md);
    box-shadow: none;
    margin-left: 0.25rem;
  }
</style>
