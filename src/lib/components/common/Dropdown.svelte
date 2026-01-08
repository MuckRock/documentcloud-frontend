<script lang="ts" context="module">
  export type { Placement } from "@floating-ui/dom";
</script>

<script lang="ts">
  import { writable } from "svelte/store";
  import {
    autoUpdate,
    computePosition,
    flip,
    offset as offsetFn,
    shift,
    type Placement,
  } from "@floating-ui/dom";

  export let position: Placement = "bottom-start";
  export let offset: number = 4;
  export let overlay = false;
  export let border = false;

  let dropdown: HTMLDivElement;
  let anchor: HTMLDivElement;
  let cleanup: () => void;
  let isOpen = false;

  const dropdownCoords = writable({ x: 0, y: 0 });

  function update() {
    const middleware = [offsetFn(offset), shift({ padding: 6 }), flip()];
    computePosition(anchor, dropdown, {
      placement: position,
      middleware,
    }).then(({ x, y }) => {
      dropdownCoords.set({ x, y });
    });
  }

  function open() {
    isOpen = true;
    update();
    cleanup = autoUpdate(anchor, dropdown, update);
  }

  function close() {
    isOpen = false;
    cleanup?.();
  }

  function toggle() {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }

  function toggleOnAnchorEvent(event: MouseEvent | KeyboardEvent) {
    switch (event.type) {
      case "click":
        toggle();
        break;
      case "keydown":
        const key = (event as KeyboardEvent).key;
        if (["Spacebar", " ", "Enter", "ArrowDown"].includes(key)) {
          toggle();
        }
        break;
    }
  }

  function closeOnEventOutside(event: MouseEvent) {
    if (!isOpen || !(event.target instanceof Element)) return;

    // Don't close if clicking this dropdown's own anchor
    if (anchor.contains(event.target)) return;

    // Close if clicking outside this dropdown's subtree
    const clickedInside =
      dropdown.contains(event.target) || anchor.contains(event.target);
    if (!clickedInside) {
      close();
    }
  }

  function closeOnEscape(event: KeyboardEvent) {
    if (isOpen && event.key === "Escape") {
      close();
    }
  }
</script>

<svelte:document onclick={closeOnEventOutside} onkeydown={closeOnEscape} />

<!-- Optional window overlay -->
{#if overlay && isOpen}
  <div class="overlay"></div>
{/if}
<!-- Element to Trigger Dropdown -->
<div
  role="button"
  tabindex={0}
  bind:this={anchor}
  class="anchor"
  class:open={isOpen}
  class:border
  on:click={toggleOnAnchorEvent}
  on:keydown={toggleOnAnchorEvent}
>
  <slot name="anchor" />
</div>
<!-- Dropdown with contents -->
<div
  bind:this={dropdown}
  class="dropdown"
  class:open={isOpen}
  style="left: {$dropdownCoords.x}px; top: {$dropdownCoords.y}px;"
>
  <slot name="inner" {close} />
</div>

<style>
  .anchor {
    display: inline-flex;
    cursor: pointer;
    border-radius: 0.5rem;
    padding: 0.075rem;
    color: var(--gray-5);
    fill: var(--gray-4);
  }
  .anchor.border {
    border: 1px solid var(--gray-2);
  }
  .anchor:hover {
    background: var(--blue-1);
  }
  .anchor.open {
    background: var(--blue-1);
    color: var(--white);
    fill: var(--white);
  }
  .dropdown {
    display: none;
    position: absolute;
    margin: 0.25rem 0;
    width: min-content;
    z-index: var(--z-dropdown);
  }
  .dropdown.open {
    display: block;
  }
  .overlay {
    z-index: var(--z-dropdownBackdrop);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--gray-5);
    opacity: 10%;
  }
</style>
