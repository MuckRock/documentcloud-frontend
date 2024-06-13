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
    component: ComponentType<SvelteComponent>;
    props?: any;
  }>;

  export const modal: ModalContext = writable(null);
</script>

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import { X16 } from "svelte-octicons";
  import Button from "../common/Button.svelte";

  const dispatch = createEventDispatcher();

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      dispatch("close");
    }
  }
</script>

<svelte:window on:keydown={onKeydown} />

<div class="modal" tabindex="-1">
  <div class="dialog" transition:fade={{ duration: 250 }}>
    <Button mode="ghost" on:click={() => dispatch("close")}>
      <X16 />
    </Button>
    <div class="content">
      <slot />
    </div>
  </div>
</div>

<style>
  .modal {
    background: rgba(92, 113, 124, 0.5);
    backdrop-filter: blur(2px);
    position: fixed;
    top: 0;
    bottom: 0;
    overflow-x: hidden;
    overflow-y: auto;
    width: 100%;
    z-index: 5;
  }

  .dialog {
    border-radius: var(--font-md, 1rem);
    background: var(--white, #fff);
    box-shadow: 0px 4px 16px 4px #99a8b3;
    margin: 5rem auto 0 auto;
    max-width: 88ch;
    overflow-x: hidden;
    overflow-y: auto;
    z-index: 5;
  }

  .content {
    display: flex;
    padding: 2rem;
    flex-direction: column;
    align-items: center;
    gap: var(--font-m, 1rem);
  }
</style>
