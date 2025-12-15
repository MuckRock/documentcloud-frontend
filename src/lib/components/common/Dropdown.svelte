<script lang="ts" context="module">
  export type { Placement } from "@floating-ui/dom";
</script>

<script lang="ts">
  import { onMount } from "svelte";
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

  const dropdownCoords = writable({ x: 0, y: 0 });

  $: isOpen = dropdown?.style.display === "block";

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
    dropdown.style.display = "block";
    update();
    cleanup = autoUpdate(anchor, dropdown, update);
  }

  function close() {
    dropdown.style.display = "";
    cleanup?.();
  }

  function toggle() {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }

  // Toggle the dropdown when the anchor is interacted with
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
      default:
    }
  }

  function isInBoundingRect(event: MouseEvent) {
    const dropdownRect = dropdown.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const clickInsideDropdown =
      event.clientX >= dropdownRect.left &&
      event.clientX <= dropdownRect.right &&
      event.clientY >= dropdownRect.top &&
      event.clientY <= dropdownRect.bottom;
    const clickInsideAnchor =
      event.clientX >= anchorRect.left &&
      event.clientX <= anchorRect.right &&
      event.clientY >= anchorRect.top &&
      event.clientY <= anchorRect.bottom;
    return clickInsideDropdown || clickInsideAnchor;
  }

  function isInSubtree(element: Element) {
    return dropdown.contains(element) || anchor.contains(element);
  }

  // Close the dropdown when a click or escape is made outside its subtree
  function closeOnEventOutside(event: MouseEvent) {
    if (event.target instanceof Element) {
      if (!isInSubtree(event.target) && !isInBoundingRect(event)) {
        close();
      }
    }
  }

  // Close the dropdown when using the Escape key
  function closeOnEscape(event: KeyboardEvent) {
    const key = (event as KeyboardEvent).key;
    if (key === "Escape") {
      close();
    }
  }

  onMount(() => {
    document.addEventListener("click", closeOnEventOutside);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("click", closeOnEventOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  });
</script>

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
  <slot {close} />
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
