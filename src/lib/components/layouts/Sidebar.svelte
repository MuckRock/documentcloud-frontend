<!-- 
 @component Sidebar
  Sidebars provide additional UI surface for controls, information, and more.
  Sidebars may be collapsed or open. When space allows, sidebars should flow
  alongside content and default to being open. When space is limited, sidebars
  should hide themselves off-screen and default to being closed.
-->

<script lang="ts" context="module">
  /**
   * Sidebar open state is stored in an id-indexed object.
   *
   * To keep track of whether a sidebar is open or not, use
   * a reactive statement, like this:
   * ```
   * $: isOpen = $sidebars['sidebar-id'];
   * ```
   */
  import { writable, type Writable } from "svelte/store";

  export const sidebars: Writable<Record<string, boolean>> = writable({});
</script>

<script lang="ts">
  import { browser } from "$app/environment";

  import { circOut } from "svelte/easing";
  import { fly, fade } from "svelte/transition";
  import { SidebarCollapse16 } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";

  export let id: string;
  export let position: "left" | "right" = "left";

  let viewWidth: undefined | number = Boolean(browser)
    ? window.innerWidth
    : undefined;

  $: isSmall = viewWidth ? viewWidth < 64 * 16 : false;
  $: {
    $sidebars[id] = isSmall ? false : true;
  }
  $: isOpen = $sidebars[id];

  $: flyOptions = {
    duration: isSmall ? 200 : 0,
    x: 400 * (position === "left" ? -1 : 1),
    easing: circOut,
  };

  $: fadeOptions = {
    duration: isSmall ? 200 : 0,
  };

  function close() {
    $sidebars[id] = false;
  }
</script>

<svelte:window bind:innerWidth={viewWidth} />

{#if isOpen}
  <aside class="sidebarContainer {position}" {id} transition:fly={flyOptions}>
    <header class:reverse={position === "left"}>
      {#if $$slots.title}
        <span class="title"><slot name="title" /></span>
      {/if}
      <Button ghost minW={false} on:click={close}>
        <span class="icon" class:flipV={position === "left"}>
          <SidebarCollapse16 />
        </span>
      </Button>
    </header>
    <main>
      <slot />
    </main>
  </aside>
  <div
    class="overlay"
    role="presentation"
    on:click={close}
    on:keydown={close}
    transition:fade={fadeOptions}
  />
{/if}

<style>
  .sidebarContainer {
    flex: 1 0 0;
    display: flex;
    flex-direction: column;
    min-width: 16rem;
    max-width: 18rem;
    max-height: 100%;
    min-height: 100%;
    overflow-y: auto;
    position: sticky;
    top: 0;
    background: var(--white);
  }

  header {
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: 2rem;
    padding: 0.5rem;
    border-bottom: 1px solid var(--gray-1);
    background: var(--white);
    position: sticky;
    top: 0;
    z-index: 1;
  }

  header.reverse {
    flex-direction: row-reverse;
  }

  header .title {
    flex: 1 1 auto;
  }

  header.reverse .title {
    text-align: right;
  }

  main {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    position: relative;
    gap: 0.5rem;
    height: 100%;
    z-index: 0;
  }

  .icon {
    display: flex;
    align-items: center;
  }

  .flipV {
    transform: rotate(180deg);
  }

  .overlay {
    display: none;
  }

  /* Start Mobile Styles */
  /* When the viewport is smaller than 1024px, we move both sidebars
  into a fixed position, then transform them to an offscreen position.
  Then, when a button in a small-only navigation bar is clicked,
  the appropriate sidebar will move out into a visible position. */

  @media (max-width: 64rem) {
    .sidebarContainer {
      min-width: 33vw;
      max-width: 100vw;
      top: 0;
      bottom: 0;
      z-index: var(--z-drawer);
      background: var(--white);
      position: fixed;
    }
    .sidebarContainer.right {
      right: 0;
      border-top-left-radius: 1rem;
      border-bottom-left-radius: 1rem;
    }
    .sidebarContainer.left {
      left: 0;
      border-top-right-radius: 1rem;
      border-bottom-right-radius: 1rem;
    }
    .overlay {
      display: block;
      position: fixed;
      z-index: calc(var(--z-drawer) - 1);
      background: var(--gray-5, #233944);
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0.75;
    }
  }
  /* End Mobile Styles */
</style>
