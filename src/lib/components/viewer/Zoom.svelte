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
  import ZoomFit16 from "$lib/components/icons/ZoomFit16.svelte";
  import { ZoomIn16, ZoomOut16 } from "svelte-octicons";

  const viewer = getViewerState();

  let zoomLevels = $derived(getZoomLevels(viewer.mode));
  let initial = $derived(getInitialZoom(page.url, viewer.mode));

  let [zoomOut, zoomIn] = $derived(
    getZoomInOut(viewer.mode, viewer.zoom, viewer.scale),
  );

  $effect(() => {
    viewer.zoom = initial || getDefaultZoom(viewer.mode);
  });
</script>

{#if zoomLevels.length}
  <div class="zoom">
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
    {#if viewer.mode === "document"}
      <div class="auto">
        <Button
          mode="primary"
          size="small"
          ghost
          minW={false}
          hover={viewer.zoom === "auto"}
          aria-label={$_("zoom.auto")}
          onclick={() => (viewer.zoom = "auto")}
        >
          <ZoomFit16 />
        </Button>
      </div>
    {/if}
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
  </div>
{/if}

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

  .auto {
    display: none;
  }

  @media (max-width: 40rem) {
    select {
      display: none;
    }

    .auto {
      display: block;
    }
  }
</style>
