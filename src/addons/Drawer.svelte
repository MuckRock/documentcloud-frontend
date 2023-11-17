<script context="module" lang="ts">
  interface closer {
    close: Function;
  }

  const drawers = new Set();
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";
  import { createEventDispatcher, onMount } from "svelte";
  import { slide } from "svelte/transition";

  export let anchor: string = "center";
  export let visible: boolean = false;

  const dispatch = createEventDispatcher();
  const instance = { close };

  let dialog: HTMLElement;

  onMount(() => {
    drawers.add(instance);

    return () => {
      drawers.delete(instance);
    };
  });

  function closeOthers() {
    drawers.forEach((d: closer) => {
      d.close(true);
    });
  }

  export function open(quiet = false) {
    visible = true;
    closeOthers();
    if (!quiet) dispatch("open");
  }

  export function close(quiet = false) {
    visible = false;
    if (!quiet) dispatch("close");
  }

  export function toggle(quiet = false) {
    visible = !visible;
    if (!quiet) dispatch(visible ? "open" : "close");
  }

  function onKeyPress(e: KeyboardEvent) {
    if (visible && e.key === "Escape") {
      close();
    }
  }
</script>

<style>
  .drawer {
    background-color: var(--menuBg, white);
    border: 1px solid #ccc;
    border-radius: calc(var(--radius, 3px) * 3);
    bottom: 1px;
    box-shadow: -1px 0px 4px 2px rgba(0, 0, 0, 0.05);
    box-sizing: border-box;
    height: calc(100% + 2px);
    position: fixed;
    top: -1px;
    z-index: 10;
    overflow: hidden;
  }

  button.close {
    margin: 0;
    top: 1.25em;
    position: absolute;
    border-radius: 9999px;
    border: transparent;
    background-color: rgba(0, 0, 0, 0.25);
    height: 24px;
    width: 24px;
    font-size: 1em;
    cursor: pointer;
    opacity: 0.7;
  }

  button.close:hover {
    opacity: 1;
  }

  .drawer.right {
    right: 0;
    border-right: none;
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
  }

  .drawer.right button.close {
    right: 1em;
  }

  .drawer.left {
    left: 0;
    border-left: none;
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
  }

  .drawer.left button.close {
    left: 1em;
  }

  .container {
    height: 100%;
    overflow-y: scroll;
  }
</style>

<svelte:window on:keydown={onKeyPress} />

{#if visible}
  <div
    transition:slide|global={{ axis: "x" }}
    class="drawer {anchor}"
    class:visible
    tabindex="-1"
    role="dialog"
  >
    <slot name="close-button">
      <button
        type="button"
        class="close"
        title={$_("drawer.close")}
        aria-label={$_("drawer.close")}
        on:click={() => close()}
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </slot>
    <div bind:this={dialog} role="document" class="container">
      <slot name="content" />
    </div>
  </div>
{/if}
