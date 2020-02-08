<script>
  import { spring } from "svelte/motion";

  export let caption;
  export let delay = 0;
  export let show = true;

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
    if (newX + tooltip.offsetWidth >= document.body.offsetWidth)
      newX -= tooltip.offsetWidth;
    if (newY < 0) newY += tooltip.offsetHeight;

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

<style lang="scss">
  span {
    display: inline-block;
    position: relative;
  }

  .tooltip {
    position: fixed;
    font-weight: normal;
    font-size: 14px;
    opacity: 0;
    pointer-events: none;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    line-height: 1em;
    padding: 0.3em 0.8em;
    border-radius: 3px;
    box-shadow: 0 0 2px #0000007a;
    z-index: $tooltipZ;
    transition: $opacity-fast;

    &.show {
      opacity: 1;
    }
  }
</style>

{#if show}
  <span on:mouseenter={handleMouseOver} on:mouseleave={handleMouseOut}>
    <div
      bind:this={tooltip}
      class="tooltip"
      class:show={mouseIn && delayShow}
      style="left: {$coords.x}px; top: {$coords.y}px;">
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
  on:resize={handleMouseOut} />
