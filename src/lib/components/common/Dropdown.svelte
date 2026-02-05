<script lang="ts" module>
  export type { Placement } from "@floating-ui/dom";
  import type { Snippet } from "svelte";
  import type { Maybe } from "$lib/api/types";
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

  interface Props {
    position?: Placement;
    offset?: number;
    overlay?: boolean;
    border?: boolean;
    anchor?: Snippet;
    inner?: Snippet<[any]>;
  }

  let {
    position = "bottom-start",
    offset = 4,
    overlay = false,
    border = false,
    anchor,
    inner,
  }: Props = $props();

  let dropdown: Maybe<HTMLDivElement> = $state();
  let anchorEl: Maybe<HTMLDivElement> = $state();
  let cleanup: () => void;
  let isOpen = $state(false);

  const dropdownCoords = writable({ x: 0, y: 0 });

  function update() {
    if (!anchorEl || !dropdown) return;
    const middleware = [offsetFn(offset), shift({ padding: 6 }), flip()];
    computePosition(anchorEl, dropdown, {
      placement: position,
      middleware,
    }).then(({ x, y }) => {
      dropdownCoords.set({ x, y });
    });
  }

  function open() {
    if (!anchorEl || !dropdown) return;
    isOpen = true;
    update();
    cleanup = autoUpdate(anchorEl, dropdown, update);
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
    if (!isOpen || !(event.target instanceof Element) || !anchorEl || !dropdown)
      return;

    // Don't close if clicking this dropdown's own anchor
    if (anchorEl.contains(event.target)) return;

    // Close if clicking outside this dropdown's subtree
    const clickedInside =
      dropdown.contains(event.target) || anchorEl.contains(event.target);
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
  bind:this={anchorEl}
  class="anchor"
  class:open={isOpen}
  class:border
  onclick={toggleOnAnchorEvent}
  onkeydown={toggleOnAnchorEvent}
>
  {@render anchor?.()}
</div>
<!-- Dropdown with contents -->
<div
  bind:this={dropdown}
  class="dropdown"
  class:open={isOpen}
  style="left: {$dropdownCoords.x}px; top: {$dropdownCoords.y}px;"
>
  {@render inner?.({ close })}
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
