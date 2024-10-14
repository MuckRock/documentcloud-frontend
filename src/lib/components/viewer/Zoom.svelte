<!-- @component
Shared zoom component for all viewer routes.

Assumes it's a child of a ViewerContext
-->
<script lang="ts">
  import { _ } from "svelte-i18n";

  import { getDefaultZoom, getZoomLevels } from "@/lib/utils/viewer";
  import { getCurrentMode, getZoom } from "./ViewerContext.svelte";

  const mode = getCurrentMode();
  const zoom = getZoom();

  $: zoomLevels = getZoomLevels($mode);
  $: $zoom = getDefaultZoom($mode);
</script>

{#if zoomLevels.length}
  <label class="zoom">
    {#if $mode === "grid"}
      {$_("zoom.size")}
    {:else}
      {$_("zoom.zoom")}
    {/if}
    <select name="zoom" bind:value={$zoom}>
      {#each zoomLevels as [value, label]}
        <option {value}>{$_(label)}</option>
      {/each}
    </select>
  </label>
{/if}

<style>
  label {
    visibility: hidden;
  }

  select {
    visibility: visible;
  }

  label.zoom {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--font-md);
  }

  label.zoom {
    justify-content: right;
  }

  select {
    padding: 0.125em 0.25rem;
    border: 1px solid var(--gray-2);
    border-radius: 0.5rem;
    font-family: var(--font-sans);
    font-size: var(--font-md);
    box-shadow: none;
  }
</style>
