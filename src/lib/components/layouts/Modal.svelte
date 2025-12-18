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

  export type ModalContext = Writable<
    Nullable<{
      title?: string;
      component: ComponentType<SvelteComponent>;
      props?: any;
    }>
  >;

  export const modal: ModalContext = writable(null);
  export const MODAL = "modal"; // constant for context
</script>

<script lang="ts">
  import type { Nullable } from "$lib/api/types";

  import { createEventDispatcher } from "svelte";
  import { quintOut } from "svelte/easing";
  import { fade, fly } from "svelte/transition";
  import { XCircle24 } from "svelte-octicons";

  import Button from "../common/Button.svelte";

  const dispatch = createEventDispatcher();

  export let maxWidth: string = "48rem";
  export let maxHeight: string = "90vh";
  export let fillViewport: boolean = false;

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
    class:fill-viewport={fillViewport}
    style:max-width={maxWidth}
    style:max-height={maxHeight}
    transition:fly={{ duration: 400, easing: quintOut, y: "25vw" }}
  >
    <header>
      <Button
        minW={false}
        ghost
        mode="primary"
        on:click={() => dispatch("close")}
      >
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
    gap: 0 1rem;
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
    padding: 0;
    border-radius: var(--font-md, 1rem);
    background: var(--white, #fff);
    box-shadow: 0px 4px 16px 4px #99a8b3;
  }

  .card.fill-viewport {
    width: 100%;
    height: auto;
  }

  .card > header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row-reverse;
    padding: 1rem;
    border-bottom: 1px solid var(--gray-2, #d8dee2);
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--font-md, 1rem);
    min-height: 0;
  }
</style>
