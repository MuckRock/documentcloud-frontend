<script lang="ts">
  import { getContext } from "svelte";
  import OrgMenu from "./OrgMenu.svelte";
  import Button from "./common/Button.svelte";
  import Logo from "./common/Logo.svelte";
  import SignedIn from "./common/SignedIn.svelte";
  import { SidebarCollapse16, SidebarExpand16 } from "svelte-octicons";
  import type { Writable } from "svelte/store";
  import type { User } from "@/api/types";

  export let modal: boolean = false;
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
    modal = false;
  }

  const me = getContext<Writable<User>>("me");
</script>

<div class="container">
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
    <main><slot name="navigation" /></main>
  </nav>
  <main class="content">
    <slot name="content" />
  </main>
  <nav class="action right large" class:active={panel === "action"} id="action">
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
      <SignedIn>{$me.name}</SignedIn>
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

<style>
  .container {
    display: flex;
    width: 100%;
    height: 100%;
    gap: 0;
    flex-shrink: 0;
    background: var(--gray-1, #f5f6f7);
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
</style>
