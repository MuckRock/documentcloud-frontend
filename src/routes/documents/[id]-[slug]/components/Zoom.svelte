<!-- @component
Shared zoom component for all viewer routes.
It exports a $zoom store that can be passed around to other components.
-->
<script context="module" lang="ts">
  import { writable, type Writable } from "svelte/store";
  import type { Sizes, ViewerMode, Zoom } from "$lib/api/types";
  import { IMAGE_WIDTHS_MAP } from "@/config/config.js";

  export const zoom: Writable<Zoom> = writable(1);

  // for typescript
  export function zoomToScale(zoom: any): number | "width" | "height" {
    if (zoom === "width" || zoom === "height") {
      return zoom;
    }

    return +zoom || 1;
  }

  export function zoomToSize(zoom: any): Sizes {
    if (IMAGE_WIDTHS_MAP.has(zoom)) {
      return zoom;
    }

    return "small";
  }
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";

  export let mode: ViewerMode;

  $: zoomLevels = getZoomLevels(mode);
  $: $zoom = getDefaultZoom(mode);

  /**
   * Generate a default zoom, based on mode
   * @param mode
   */
  function getDefaultZoom(mode: ViewerMode): Zoom {
    switch (mode) {
      case "document":
        return "width";

      case "annotating":
        return "width";

      case "redacting":
        return "width";

      case "grid":
        return "small";

      default:
        return 1;
    }
  }

  /**
   * Generate zoom levels based on mode, since each zooms in a slightly different way
   */
  function getZoomLevels(mode: ViewerMode): (string | number)[][] {
    switch (mode) {
      case "document":
      case "annotating":
      case "redacting":
        return [
          ["width", $_("zoom.fitWidth")],
          ["height", $_("zoom.fitHeight")],
          [0.5, "50%"],
          [0.75, "75%"],
          [1, "100%"],
          [1.25, "125%"],
          [1.5, "150%"],
          [2, "200%"],
        ];

      case "text":
        return [
          [0.5, "50%"],
          [0.75, "75%"],
          [1, "100%"],
          [1.25, "125%"],
          [1.5, "150%"],
          [2, "200%"],
        ];

      case "grid":
        return [
          ["thumbnail", $_("zoom.thumbnail")],
          ["small", $_("zoom.small")],
          ["normal", $_("zoom.normal")],
          ["large", $_("zoom.large")],
        ];

      default:
        // todo: notes, maybe
        return [];
    }
  }
</script>

{#if zoomLevels.length}
  <label class="zoom">
    {#if mode === "grid"}
      {$_("zoom.size")}
    {:else}
      {$_("zoom.zoom")}
    {/if}
    <select name="zoom" bind:value={$zoom}>
      {#each zoomLevels as [value, label]}
        <option {value}>{label}</option>
      {/each}
    </select>
  </label>
{/if}

<style>
  label.zoom {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--font-md);
  }

  label.zoom select {
    border: none;
    font-family: var(--font-sans);
    font-size: var(--font-md);
  }

  label.zoom {
    justify-content: right;
  }
</style>
