<script lang="ts">
  import type { ComponentType, SvelteComponent } from "svelte";
  import type { Writable } from "svelte/store";
  import type { User } from "@/api/types";

  import { getContext } from "svelte";
  import {
    SidebarCollapse16,
    SidebarExpand16,
    XCircle24,
  } from "svelte-octicons";

  import OrgMenu from "./OrgMenu.svelte";
  import Button from "./common/Button.svelte";
  import Logo from "./common/Logo.svelte";

  /*
  There is one modal position on the page, so setting the component opens the modal
  */
  export let modal: ComponentType<SvelteComponent> = null;

  /*
  The basement component goes in the basement, and there are two sides
  */
  export let basementComponent: ComponentType<SvelteComponent> = null;
  export let basement: "left" | "right" | null = null;

  let panel: "navigation" | "action" | null = null;

  function closePanel() {
    panel = null;
  }

  function openPanel(name: typeof panel): () => void {
    return () => {
      panel = name;
    };
  }

  function closeBasement() {
    if (basement !== null) {
      basement = null;
    }
  }

  function closeModal() {
    modal = null;
  }

  const me = getContext<Writable<User>>("me");
</script>

<div
  class="layout"
  class:left={basement === "left"}
  class:right={basement === "right"}
>
  <div class="modal" tabindex="-1" class:hidden={!modal}>
    <div class="backdrop" role="presentation" on:click={closeModal} />
    <svelte:component this={modal} />
  </div>

  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div
    class="container"
    on:click={closeBasement}
    on:keydown={closeBasement}
    role="dialog"
  >
    <nav class="small">
      <Button mode="ghost" on:click={openPanel("navigation")}>
        <SidebarCollapse16 />
      </Button>
      <a href="/" class="logo"><Logo /></a>
      <Button mode="ghost" on:click={openPanel("action")}>
        <SidebarExpand16 />
      </Button>
    </nav>
    <nav
      class="navigation left large"
      class:active={panel === "navigation"}
      id="navigation"
    >
      <header class="header">
        <div class="small closePane">
          <Button mode="ghost" on:click={closePanel}>
            <SidebarExpand16 />
          </Button>
        </div>
        <a href="/" class="logo"><Logo /></a>
      </header>
      <main>
        <slot name="navigation" />
      </main>
    </nav>
    <main class="content">
      <slot name="content" />
    </main>
    <nav
      class="action right large"
      class:active={panel === "action"}
      id="action"
    >
      <header class="header">
        <OrgMenu />
        <div class="small closePane">
          <Button mode="ghost" on:click={closePanel}>
            <SidebarCollapse16 />
          </Button>
        </div>
      </header>
      <main><slot name="action" /></main>
      <footer>
        <p>{$me?.name}</p>
        <p>Language</p>
        <p>Help</p>
      </footer>
    </nav>
    <div
      class="small overlay"
      class:active={panel !== null}
      role="presentation"
      on:click={closePanel}
      on:keydown={closePanel}
    />
  </div>
  <div class="basement">
    <svelte:component this={basementComponent} />
  </div>
</div>

<style>
  .container {
    display: flex;
    width: 100%;
    height: 100%;
    gap: 0;
    flex-shrink: 0;
    background: var(--gray-1, #f5f6f7);
    overflow: hidden;
  }
  header {
    display: flex;
    padding: 1rem;
    gap: 0.5rem;
    align-items: flex-start;
    align-self: stretch;
  }
  main {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 2rem;
    flex: 1 0 0;
    max-height: 100%;
    overflow-y: auto;
  }
  nav {
    flex: 1 0 0;
    min-width: 16rem;
    max-width: 18rem;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  .logo {
    height: 2rem;
    width: auto;
  }
  .navigation {
    border-right: 1px solid var(--gray-2, #d8dee2);
  }
  .action {
    border-left: 1px solid var(--gray-2, #d8dee2);
  }
  .action footer {
    display: flex;
    width: 100%;
    position: sticky;
    bottom: 0;
    padding: 1rem;
    z-index: 1;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.875rem;

    background: var(--gray-1, #f5f6f7);
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

  nav.small {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    flex: 0 0 0;
    max-width: unset;

    border-bottom: 1px solid var(--gray-2, #d8dee2);
  }

  nav.small .logo {
    height: 1.5rem;
    width: auto;
  }

  .small.overlay {
    display: block;
    visibility: hidden;
  }

  @media (max-width: 64rem) {
    .container {
      flex-direction: column;
    }
    .small {
      display: block;
    }
    nav.large {
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
    nav.large.right {
      transform: translateX(100%);
      right: 0;
      border-top-left-radius: 1rem;
      border-bottom-left-radius: 1rem;
    }
    nav.large.left {
      left: 0;
      transform: translateX(-100%);
      border-top-right-radius: 1rem;
      border-bottom-right-radius: 1rem;
    }
    nav.large.active {
      display: flex;
      transform: translateX(0);
      transition: transform 0.25s ease-in-out;
    }
    nav.large header {
      align-items: center;
      flex-direction: row-reverse;
      padding: 0.5rem;
    }
    nav.large .logo {
      display: none;
    }
    nav.small {
      display: flex;
    }
    .small.overlay {
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

  /* Basement and Layout Shift */
  .layout {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
  .container {
    transform: translateX(0);
    transition:
      transform 0.5s ease-in-out,
      border-radius 0.5s ease-in-out,
      box-shadow 0.5s linear;
  }
  .basement {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    background: var(--blue-1);
  }
  .layout.right .container {
    transform: translateX(-75%);
    border-top-right-radius: 1rem;
    border-bottom-right-radius: 1rem;
    overflow: hidden;
    box-shadow: 0px 4px 16px 4px var(--gray-3, #99a8b3);
  }
  .layout.right .basement {
    padding-left: 25%;
  }
  .layout.left .container {
    transform: translateX(75%);
    border-top-left-radius: 1rem;
    border-bottom-left-radius: 1rem;
    overflow: hidden;
    box-shadow: 0px 4px 16px 4px var(--gray-3, #99a8b3);
  }
  .layout.left .basement {
    padding-right: 25%;
  }

  /* Modal */
  .modal {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    padding: 0 2rem;
    scroll-padding: -2rem;
    max-height: 100%;
    overflow-y: auto;
  }

  .modal.hidden {
    display: none;
    background-color: transparent;
  }

  .modal .backdrop {
    position: fixed;
    z-index: -1;
    width: 100%;
    height: 100%;
    background: rgba(35, 57, 68, 0.5);
    backdrop-filter: blur(2px);
  }
</style>
