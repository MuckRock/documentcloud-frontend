<script lang="ts">
  import type { Component } from "svelte";
  import type { Maybe } from "$lib/api/types";

  import { writable } from "svelte/store";
  import {
    computePosition,
    flip,
    offset as offsetFn,
    arrow as arrowFn,
    shift,
    type Placement,
    type MiddlewareData,
  } from "@floating-ui/dom";

  interface Props {
    caption: string | Component | undefined;
    placement?: Placement;
    offset?: number;
    arrow?: boolean;
    children?: import("svelte").Snippet;
  }

  let {
    caption,
    placement = "bottom",
    offset = 6,
    arrow = false,
    children,
  }: Props = $props();

  let anchor: Maybe<HTMLDivElement> = $state();
  let arrowRef: Maybe<HTMLDivElement> = $state();
  let tooltip: Maybe<HTMLDivElement> = $state();
  let tooltipCoords = writable({ x: 0, y: 0 });

  function positionArrow(placement: Placement, middlewareData: MiddlewareData) {
    if (!arrowRef) return;
    // Accessing the data
    const { x: arrowX, y: arrowY } = middlewareData.arrow ?? {};

    const placementFirst = placement.split("-")[0] ?? "top";
    const staticSide =
      {
        top: "bottom",
        right: "left",
        bottom: "top",
        left: "right",
      }[placementFirst] ?? "bottom";

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
    if (!anchor || !tooltip) return;
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
    if (tooltip) {
      tooltip.style.display = "block";
    }
    update();
  }

  function hideTooltip() {
    if (tooltip) {
      tooltip.style.display = "";
    }
  }
</script>

<div
  bind:this={tooltip}
  role="tooltip"
  class="tooltip"
  style="left: {$tooltipCoords.x}px; top: {$tooltipCoords.y}px;"
>
  {caption}
  {#if arrow}<div class="arrow" bind:this={arrowRef}></div>{/if}
</div>
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  role="presentation"
  class="anchor"
  bind:this={anchor}
  tabindex="0"
  onmouseenter={showTooltip}
  onmouseleave={hideTooltip}
  onfocus={showTooltip}
  onblur={hideTooltip}
>
  {@render children?.()}
</div>

<style>
  .anchor {
    display: var(--display, flex);
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
    z-index: var(--z-tooltip, 21);
    max-width: 16rem;
  }
</style>
