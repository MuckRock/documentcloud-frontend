<!-- @component
A modal that displays some content over other content.
It's either here or not. There is no "closed" state.

Any content is slotted.

This module also exports a writable $modal store and a ModalContext type, describing the shape
of the $modal store. These are used to set the active modal on any given page.
-->
<script context="module" lang="ts">
  import type { ComponentType, SvelteComponent } from "svelte";
  import { writable, type Writable } from "svelte/store";

  export type ModalContext = Writable<{
    title?: string;
    component: ComponentType<SvelteComponent>;
    props?: any;
  }>;

  export const modal: ModalContext = writable(null);
  export const MODAL = "modal"; // constant for context
</script>

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { quintOut } from "svelte/easing";
  import { fade, fly } from "svelte/transition";
  import { XCircle24 } from "svelte-octicons";
  import Button from "../common/Button.svelte";

  const dispatch = createEventDispatcher();

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      dispatch("close");
    }
  }
</script>

<svelte:window on:keydown={onKeydown} />

<div class="backdrop" transition:fade={{ duration: 200 }}>
  <div
    class="dialog card"
    transition:fly={{ duration: 400, easing: quintOut, y: "25vw" }}
  >
    <header>
      <Button minW={false} mode="ghost" on:click={() => dispatch("close")}>
        <XCircle24 />
      </Button>
      <slot name="title" />
    </header>
    <main class="content">
      <slot />
    </main>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    z-index: var(--z-modal);
    background: rgba(92, 113, 124, 0.5);
    backdrop-filter: blur(2px);
    padding: var(--font-md, 1rem);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 40rem;
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
    padding: 1.5rem;
    border-radius: var(--font-md, 1rem);
    background: var(--white, #fff);
    box-shadow: 0px 4px 16px 4px #99a8b3;
  }

  .card > header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row-reverse;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--font-md, 1rem);
  }
</style>
