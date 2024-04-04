<script lang="ts">
  import type { Writable } from "svelte/store";
  import { type Org, type User } from "@/api/types";

  import { getContext } from "svelte";
  import { SidebarCollapse16, SidebarExpand16 } from "svelte-octicons";

  import Button from "./common/Button.svelte";
  import Flex from "./common/Flex.svelte";
  import Logo from "./common/Logo.svelte";
  import SignedIn from "./common/SignedIn.svelte";
  import UserMenu from "./accounts/UserMenu.svelte";
  import OrgMenu from "./accounts/OrgMenu.svelte";

  import { SIGN_IN_URL } from "@/config/config";

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
  const org = getContext<Writable<Org>>("org");
</script>

<div class="container">
  <header>
    {#if $$slots.navigation}
      <div class="small openPane">
        <Button mode="ghost" on:click={openPanel("navigation")}>
          <SidebarCollapse16 />
        </Button>
      </div>
    {/if}
    <a href="/" class="logo"><Logo /></a>
    <div class="breadcrumbs"></div>
    <SignedIn>
      <Flex>
        <OrgMenu org={$org} />
        <UserMenu user={$me} />
      </Flex>
      <Button slot="signedOut" mode="primary" href={SIGN_IN_URL}>
        Sign In
      </Button>
    </SignedIn>
    {#if $$slots.action}
      <div class="small openPane">
        <Button mode="ghost" on:click={openPanel("action")}>
          <SidebarExpand16 />
        </Button>
      </div>
    {/if}
  </header>

  <main>
    {#if $$slots.navigation}
      <nav
        class="navigation left"
        class:active={panel === "navigation"}
        id="navigation"
      >
        <div class="small closePane">
          <Button mode="ghost" on:click={closePanel}>
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
      <nav class="action right" class:active={panel === "action"} id="action">
        <div class="small closePane">
          <Button mode="ghost" on:click={closePanel}>
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
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    gap: 0;
    flex-shrink: 0;
    background: var(--gray-1, #f5f6f7);
  }

  header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background: var(--white, #ffffff);
    border-bottom: 1px solid var(--gray-2, #d8dee2);
    box-shadow: var(--shadow);
    flex: 0 0 auto;
    padding: 0 1rem;
    z-index: 1;
  }

  main {
    flex: 1 0 0;
    display: flex;
    flex-direction: row;
    overflow: hidden;
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
  }

  .logo {
    height: 1.5rem;
    width: auto;
    padding: 0 0.5rem;
  }

  .breadcrumbs {
    flex: 1 0 0;
  }

  .navigation {
    border-right: 1px solid var(--gray-2, #d8dee2);
  }

  .action {
    border-left: 1px solid var(--gray-2, #d8dee2);
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
    header {
      gap: 0.5rem;
      overflow-x: auto;
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
