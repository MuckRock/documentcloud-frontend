<script>
  import { spring } from "svelte/motion";

  export let caption;
  export let delay = 0;
  export let show = true;

  export let offsetTop = null;
  export let offsetRight = null;

  $: top = offsetTop == null ? 0 : offsetTop;

  let mouseIn = false;
  let tooltip;
  let coords = spring({ x: 0, y: 0 });
  let delayShow = true;
  let delayTimer = null;

  function setPosition(e, hard = false) {
    if (tooltip == null) return;
    let newX = e.clientX;
    let newY = e.clientY - tooltip.offsetHeight;

    // If the planned tooltip coordinates run offscreen, adjust accordingly
    if (
      newX + tooltip.offsetWidth >=
      (offsetRight == null ? document.body.offsetWidth : offsetRight)
    )
      newX -= tooltip.offsetWidth;
    if (newY < top) newY += tooltip.offsetHeight;

    // Update x and y
    coords.set({ x: newX, y: newY }, { hard });
  }

  function setUpDelay() {
    // Clear existing timer
    if (delayTimer != null) {
      clearTimeout(delayTimer);
      delayTimer = null;
    }

    // Create a new timer
    if (delay > 0) {
      delayShow = false;
      delayTimer = setTimeout(() => (delayShow = true), delay);
    } else {
      delayShow = true;
    }
  }

  function handleMouseOver(e) {
    setUpDelay();
    mouseIn = true;
    setPosition(e, true);
  }

  function handleMouseOut() {
    mouseIn = false;
  }

  function handleMouseMove(e) {
    if (!mouseIn) return;
    setPosition(e);
  }
</script>

{#if show}
  <span
    on:mouseenter={handleMouseOver}
    on:mouseleave={handleMouseOut}
    role="tooltip"
  >
    <div
      bind:this={tooltip}
      class="tooltip"
      class:show={mouseIn && delayShow}
      style="left: {$coords.x}px; top: {$coords.y}px;"
    >
      <slot name="caption">{caption}</slot>
    </div>
    <slot />
  </span>
{:else}
  <slot />
{/if}

<svelte:window
  on:mousemove={handleMouseMove}
  on:scroll={handleMouseOut}
  on:resize={handleMouseOut}
/>

<style>
  span {
    display: contents;
    position: relative;
  }

  .tooltip {
    font-weight: normal;
    font-size: 14px;
    opacity: 0;
    pointer-events: none;
    background: var(--gray-5);
    color: var(--gray-1);
    line-height: 1.2em;
    padding: 0.3em 0.8em;
    border-radius: 3px;
    box-shadow: 0 0 2px #0000007a;
    z-index: var(--z-toast, 19);
    transition: opacity 0.25s ease;
    max-width: 16rem;
  }

  .tooltip.show {
    opacity: 1;
  }
</style>
