<!-- @component
This is a box to draw redactions on.
It's layered over a PDF page and allows us to render redactions and draw new ones.
-->
<script context="module" lang="ts">
  import type { Redaction } from "$lib/api/types";
  import { writable, type Writable } from "svelte/store";

  export const redactions: Writable<Redaction[]> = writable([]);

  function width(redaction: Redaction): number {
    return redaction.x2 - redaction.x1;
  }

  function height(redaction: Redaction): number {
    return redaction.y2 - redaction.y1;
  }
</script>

<script lang="ts">
  export let active = false;
  export let page_number: number; // 0-indexed
</script>

<div class="redactions" class:active>
  {#each $redactions.filter((r) => r.page_number === page_number) as redaction}
    <span
      class="redaction"
      style:left="{redaction.x1 * 100}%"
      style:width="{width(redaction) * 100}%"
      style:top="{redaction.y1 * 100}%"
      style:height="{height(redaction) * 100}%"
    ></span>
  {/each}
</div>

<style>
  .redactions {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;

    pointer-events: none;
  }

  .redactions.active {
    pointer-events: all;
    cursor: crosshair;
  }

  .redaction {
    background-color: var(--black, black);
    position: absolute;
    pointer-events: none;
  }
</style>
