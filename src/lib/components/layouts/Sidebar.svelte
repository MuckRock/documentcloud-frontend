<script lang="ts">
  import Button from "$lib/components/common/Button.svelte";
  import { SidebarCollapse16, SidebarExpand16 } from "svelte-octicons";

  export let isOpen = false;

  const open = () => (isOpen = true);
  const close = () => (isOpen = false);
</script>

<div class="container">
  <div class="small openPane">
    <Button minW={false} ghost mode="primary" on:click={open}>
      <SidebarExpand16 />
    </Button>
  </div>
  <aside class="action right" class:active={isOpen} id="action">
    <div class="small closePane">
      <Button ghost mode="primary" on:click={close}>
        <SidebarCollapse16 />
      </Button>
    </div>
    <slot />
  </aside>
</div>
<div
  class="small overlay"
  class:active={isOpen}
  role="presentation"
  on:click={close}
  on:keydown={close}
/>

<style>
  .container aside {
    flex: 1 0 0;
    min-width: 16rem;
    max-width: 18rem;
    max-height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    position: relative;
    padding: 1rem;
    gap: 1rem;
  }

  /* Start Mobile Styles */
  /* When the viewport is smaller than 1024px, we move both sidebars
  into a fixed position, then transform them to an offscreen position.
  Then, when a button in a small-only navigation bar is clicked,
  the appropriate sidebar will move out into a visible position. */

  .small {
    display: none;
  }
  /* End Mobile Styles */
  @media (max-width: 64rem) {
    .small {
      display: block;
    }
    .container {
      min-width: 33vh;
      max-width: 100vh;
      display: flex;
      position: fixed;
      top: 0;
      bottom: 0;
      background: var(--gray-1, #f5f6f7);
      z-index: var(--z-drawer);
      transition: transform 0.25s ease-in-out;
      overflow: hidden;
    }
    .container.right {
      transform: translateX(100%);
      right: 0;
      border-top-left-radius: 1rem;
      border-bottom-left-radius: 1rem;
    }
    .container.left {
      left: 0;
      transform: translateX(-100%);
      border-top-right-radius: 1rem;
      border-bottom-right-radius: 1rem;
    }
    .container.active {
      display: flex;
      transform: translateX(0);
      transition: transform 0.25s ease-in-out;
    }
    .small.overlay {
      visibility: hidden;
      position: fixed;
      z-index: calc(var(--z-drawer) - 1);
      background: var(--gray-5, #233944);
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0;
      transition:
        opacity 0.25s linear,
        visibility 0s linear 0.25s;
    }
    .small.overlay.active {
      visibility: visible;
      opacity: 0.75;
      transition:
        opacity 0.25s linear,
        visibility 0s linear 0s;
    }
  }
</style>
