<script lang="ts">
  import {
    computePosition,
    flip,
    offset as offsetFn,
    arrow as arrowFn,
    shift,
    type Placement,
    type MiddlewareData,
  } from "@floating-ui/dom";
  import { type ComponentType } from "svelte";
  import { writable } from "svelte/store";

  export let caption: string | ComponentType;
  export let placement: Placement = "bottom";
  export let offset: number = 6;
  export let arrow = false;

  let anchor: HTMLDivElement;
  let tooltip: HTMLDivElement;
  let arrowRef: HTMLDivElement;
  let tooltipCoords = writable({ x: 0, y: 0 });

  function positionArrow(placement: Placement, middlewareData: MiddlewareData) {
    // Accessing the data
    const { x: arrowX, y: arrowY } = middlewareData.arrow;

    const staticSide = {
      top: "bottom",
      right: "left",
      bottom: "top",
      left: "right",
    }[placement.split("-")[0]];

    Object.assign(arrowRef.style, {
      left: arrowX != null ? `${arrowX}px` : "",
      top: arrowY != null ? `${arrowY}px` : "",
      right: "",
      bottom: "",
      [staticSide]: "-4px",
    });
  }

  function update() {
    const middleware = [offsetFn(offset), shift({ padding: 6 }), flip()];
    if (arrowRef) middleware.push(arrowFn({ element: arrowRef }));
    computePosition(anchor, tooltip, {
      placement,
      middleware,
    }).then(({ x, y, placement, middlewareData }) => {
      tooltipCoords.set({ x, y });
      if (arrowRef) {
        positionArrow(placement, middlewareData);
      }
    });
  }

  function showTooltip() {
    tooltip.style.display = "block";
    update();
  }

  function hideTooltip() {
    tooltip.style.display = "";
  }
</script>

<div
  bind:this={tooltip}
  role="tooltip"
  class="tooltip"
  style="left: {$tooltipCoords.x}px; top: {$tooltipCoords.y}px;"
>
  <slot name="caption">{caption}</slot>
  {#if arrow}<div class="arrow" bind:this={arrowRef}></div>{/if}
</div>
<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div
  role="presentation"
  class="anchor"
  bind:this={anchor}
  tabindex="0"
  on:mouseenter={showTooltip}
  on:mouseleave={hideTooltip}
  on:focus={showTooltip}
  on:blur={hideTooltip}
>
  <slot />
</div>

<style>
  .anchor {
    display: inline-block;
  }
  .arrow {
    position: absolute;
    background: var(--gray-5);
    width: 0.5rem;
    height: 0.5rem;
    transform: rotate(45deg);
  }
  .tooltip {
    display: none;
    width: max-content;
    position: absolute;
    top: 0;
    left: 0;
    background: var(--gray-5);
    color: var(--gray-1);
    font-weight: var(--font-semibold);
    font-size: var(--font-sm);
    line-height: 1.2em;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    box-shadow: var(--shadow-1);
    z-index: var(--z-toast, 19);
    max-width: 16rem;
  }
</style>
