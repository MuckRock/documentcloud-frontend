<script lang="ts">
  import { SidebarCollapse16, SidebarExpand16 } from "svelte-octicons";
  import Button from "../common/Button.svelte";

  let panel: "navigation" | "action" | null = null;

  function closePanel() {
    panel = null;
  }

  function openPanel(name: typeof panel): () => void {
    return () => {
      panel = name;
    };
  }
</script>

<main>
  {#if $$slots.navigation}
    <div class="small openPane">
      <Button
        minW={false}
        ghost
        mode="primary"
        on:click={openPanel("navigation")}
      >
        <SidebarCollapse16 />
      </Button>
    </div>
    <nav
      class="navigation left"
      class:active={panel === "navigation"}
      id="navigation"
    >
      <div class="small closePane">
        <Button ghost mode="primary" on:click={closePanel}>
          <SidebarExpand16 />
        </Button>
      </div>
      <slot name="navigation" />
    </nav>
  {/if}

  <article class="content">
    <slot name="content" />
  </article>

  {#if $$slots.action}
    <div class="small openPane">
      <Button minW={false} ghost mode="primary" on:click={openPanel("action")}>
        <SidebarExpand16 />
      </Button>
    </div>
    <nav class="action right" class:active={panel === "action"} id="action">
      <div class="small closePane">
        <Button ghost mode="primary" on:click={closePanel}>
          <SidebarCollapse16 />
        </Button>
      </div>
      <slot name="action" />
    </nav>
  {/if}
</main>
<div
  class="small overlay"
  class:active={panel !== null}
  role="presentation"
  on:click={closePanel}
  on:keydown={closePanel}
/>

<style>
  main {
    flex: 1 0 0;
    display: flex;
    flex-direction: row;
    overflow: hidden;
    max-width: var(--app-max-w, 100rem);
    margin: 0 auto;
    height: 100%;
  }

  nav {
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

  article {
    flex: 1 0 0;
    display: flex;
    flex-direction: row;
    max-height: 100%;
    max-width: 100%;
    overflow-y: auto;

    background: var(--gray-1);
    /* margin: 0.875rem 0; */
    border: 1px solid var(--gray-2);
    /* border-radius: var(--radius, 0); */
    box-shadow: inset var(--shadow-2);
  }

  .content {
    padding: 0;
  }

  /* Start Mobile Styles */
  /* When the viewport is smaller than 1024px, we move both sidebars
  into a fixed position, then transform them to an offscreen position.
  Then, when a button in a small-only navigation bar is clicked,
  the appropriate sidebar will move out into a visible position. */

  .small {
    display: none;
  }

  @media (max-width: 64rem) {
    .small {
      display: block;
    }
    nav {
      min-width: 33vh;
      max-width: 100vh;
      display: flex;
      position: fixed;
      top: 0;
      bottom: 0;
      background: var(--gray-1, #f5f6f7);
      z-index: 2;
      transition: transform 0.25s ease-in-out;
      overflow: hidden;
    }
    nav.right {
      transform: translateX(100%);
      right: 0;
      border-top-left-radius: 1rem;
      border-bottom-left-radius: 1rem;
    }
    nav.left {
      left: 0;
      transform: translateX(-100%);
      border-top-right-radius: 1rem;
      border-bottom-right-radius: 1rem;
    }
    nav.active {
      display: flex;
      transform: translateX(0);
      transition: transform 0.25s ease-in-out;
    }
    .small.overlay {
      visibility: hidden;
      position: fixed;
      z-index: 1;
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
  /* End Mobile Styles */
</style>
