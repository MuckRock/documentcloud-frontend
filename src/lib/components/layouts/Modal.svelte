<!-- @component
A modal that displays some content over other content.
It's either here or not. There is no "closed" state.

Any content is slotted.
-->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import { X16 } from "svelte-octicons";
  import Button from "../common/Button.svelte";

  const dispatch = createEventDispatcher();
</script>

<div class="modal" tabindex="-1">
  <div class="dialog" transition:fade>
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
  }

  .dialog {
    border-radius: var(--font-md, 1rem);
    background: var(--white, #fff);
    box-shadow: 0px 4px 16px 4px #99a8b3;
    margin: 10rem auto 0 auto;
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
