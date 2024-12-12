<!-- @component
This is a box to draw redactions on.
It's layered over a PDF page and allows us to render redactions and draw new ones.
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
  export let active = false;
  export let page_number: number; // 0-indexed

  let container: HTMLElement;
  let currentRedaction: Nullable<Redaction> = null;

  $: redactions_for_page = [...$pending, ...$redactions].filter(
    (r) => r.page_number === page_number,
  );

  // handle interaction events
  let drawStart: Nullable<[x: number, y: number]> = null;
  let drawing = false;

  function getLayerPosition(e: PointerEvent): [x: number, y: number] {
    // pointer position in window
    const { offsetX, offsetY } = e;
    // page dimensions
    const { clientWidth, clientHeight } = e.target as HTMLDivElement;
    // box points
    return [offsetX / clientWidth, offsetY / clientHeight];
  }

  function startDrawingBox(e: PointerEvent) {
    if (!active) return;

    const [x, y] = getLayerPosition(e);

    drawing = true;
    drawStart = [x, y];
    // at the beginning, the box is just a point
    currentRedaction = {
      page_number,
      x1: x,
      x2: x,
      y1: y,
      y2: y,
    };
  }

  function continueDrawingBox(e: PointerEvent) {
    if (!active || !drawing || !drawStart || !currentRedaction) return;

    const [x, y] = getLayerPosition(e);
    const [startX, startY] = drawStart;

    const movingRight = x > startX;
    const movingDown = y > startY;

    const x1 = movingRight ? startX : x;
    const x2 = movingRight ? x : startX;
    const y1 = movingDown ? startY : y;
    const y2 = movingDown ? y : startY;

    currentRedaction = {
      page_number,
      x1,
      x2,
      y1,
      y2,
    };
  }

  function finishDrawingBox(e: PointerEvent) {
    if (!active || !drawing || !currentRedaction) return;

    $redactions = [...$redactions, currentRedaction];

    // reset drawing state
    currentRedaction = null;
    drawStart = null;
    drawing = false;
  }
</script>

<div
  class="redactions"
  class:active
  bind:this={container}
  on:pointerdown={startDrawingBox}
  on:pointermove={continueDrawingBox}
  on:pointerup={finishDrawingBox}
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
