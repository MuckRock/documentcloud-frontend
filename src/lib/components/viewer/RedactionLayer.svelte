<!-- @component
This is a box to draw redactions on.
It's layered over a PDF page and allows us to render redactions and draw new ones.
When saved, redactions are burned into the PDF.
So this layer is only showing unsaved redactions.
-->
<script context="module" lang="ts">
  import type { Redaction, Nullable } from "$lib/api/types";
  import { get, writable, type Writable } from "svelte/store";

  // active redactions
  export const redactions: Writable<Redaction[]> = writable([]);

  // redactions being processed on the server
  export const pending: Writable<Redaction[]> = writable([]);

  function width(redaction: Redaction): number {
    return Math.abs(redaction.x2 - redaction.x1);
  }

  function height(redaction: Redaction): number {
    return Math.abs(redaction.y2 - redaction.y1);
  }

  export function undo() {
    redactions.set(get(redactions).slice(0, -1));
  }

  export function clear() {
    redactions.set([]);
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import { beforeNavigate } from "$app/navigation";

  export let active = false;
  export let page_number: number; // 0-indexed

  let container: HTMLElement;
  let currentRedaction: Nullable<Redaction> = null;

  $: redactions_for_page = [...$pending, ...$redactions].filter(
    (r) => r.page_number === page_number,
  );

  // handle interaction events
  let dragging = false;

  function pointerdown(e: PointerEvent) {
    if (!active) return;

    dragging = true;

    const { offsetX, offsetY } = e;
    const { clientWidth, clientHeight } = e.target as HTMLElement;

    currentRedaction = {
      page_number,
      x1: offsetX / clientWidth,
      x2: offsetX / clientWidth,
      y1: offsetY / clientHeight,
      y2: offsetY / clientHeight,
    };
  }

  function pointermove(e: PointerEvent) {
    if (!dragging || !active || !currentRedaction) return;

    const { offsetX, offsetY } = e;
    const { clientWidth, clientHeight } = e.target as HTMLElement;

    const x = offsetX / clientWidth;
    const y = offsetY / clientHeight;

    currentRedaction = {
      page_number,
      x1: Math.min(currentRedaction.x1, x),
      x2: Math.max(currentRedaction.x2, x),
      y1: Math.min(currentRedaction.y1, y),
      y2: Math.max(currentRedaction.y2, y),
    };
  }

  function pointerup(e: PointerEvent) {
    dragging = false;
    if (!currentRedaction) return;

    const { offsetX, offsetY } = e;
    const { clientWidth, clientHeight } = e.target as HTMLElement;

    const x = offsetX / clientWidth;
    const y = offsetY / clientHeight;

    currentRedaction = {
      page_number,
      x1: Math.min(currentRedaction.x1, x),
      x2: Math.max(currentRedaction.x2, x),
      y1: Math.min(currentRedaction.y1, y),
      y2: Math.max(currentRedaction.y2, y),
    };

    $redactions = [...$redactions, currentRedaction];
    currentRedaction = null;
  }

  beforeNavigate(({ cancel }) => {
    // if there's redactions, confirm before navigating away
    if ($redactions.length > 0) {
      if (confirm($_("redact.leaveWarning"))) {
        clear();
        return;
      } else {
        cancel();
      }
    }
  });

  onMount(() => {
    // before unmounting the component, clear the current redactions
    return () => {
      clear();
    };
  });
</script>

<div
  class="redactions"
  class:active
  bind:this={container}
  on:pointerdown={pointerdown}
  on:pointermove={pointermove}
  on:pointerup={pointerup}
>
  {#each redactions_for_page as redaction}
    <span
      class="redaction"
      style:left="{redaction.x1 * 100}%"
      style:width="{width(redaction) * 100}%"
      style:top="{redaction.y1 * 100}%"
      style:height="{height(redaction) * 100}%"
    ></span>
  {/each}

  {#if currentRedaction}
    <span
      class="current redaction"
      style:left="{currentRedaction.x1 * 100}%"
      style:width="{width(currentRedaction) * 100}%"
      style:top="{currentRedaction.y1 * 100}%"
      style:height="{height(currentRedaction) * 100}%"
    ></span>
  {/if}
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
