<script>
  import { onMount, tick } from "svelte";
  import { router } from "@/router/router";
  import emitter from "@/emit";

  const emit = emitter({
    active() {},
  });

  export let horizPadding = 5;
  export let vertPadding = 10;
  const MENU_OFFSET = 1; // vert offset for menu

  export let table;
  export let bordered;
  export let fixed = false;
  export let badge = "";

  let active = false;

  $: {
    emit.active(active);
  }

  // Sizes
  let titleWidth = 0;
  let menuLeft = 0;
  let menuTop = 0;

  // DOM elements
  let title;
  let titleBg;
  let menu;

  function revealOrHide() {
    active = !active;
  }

  function hide() {
    active = false;
  }

  async function computeSizes() {
    if (title == null || titleBg == null || menu == null) return;
    titleWidth = title.getBoundingClientRect().width;

    menuLeft = 0;
    menuTop = 0;

    await tick();
    if (title == null || titleBg == null || menu == null) return;

    // Set menu dimensions relative to title background
    const titleBgRect = titleBg.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    menuLeft = fixed ? titleBgRect.x : titleBgRect.x - menuRect.x;
    menuTop = fixed
      ? titleBgRect.y + titleBgRect.height
      : titleBgRect.y + titleBgRect.height - menuRect.y;
  }

  async function handleResize() {
    hide();
    await computeSizes();
  }

  onMount(async () => {
    await computeSizes();
    router.writables.resolvedRoute.subscribe(async () => {
      await computeSizes();
    });
  });
</script>

<style lang="scss">
  span {
    display: inline-block;
    position: relative;

    cursor: pointer;

    &.table {
      display: table-cell;
      vertical-align: middle;
    }

    &.titlebg {
      @include menu;

      border-bottom-left-radius: 0;
      position: absolute;
      cursor: pointer;
      pointer-events: none;
      visibility: hidden;

      &.active {
        pointer-events: inherit;
        visibility: visible;
      }

      &.bordered {
        pointer-events: inherit;
        box-shadow: none;
        background: white;
        border-radius: $radius;
        visibility: visible;
      }
    }

    &.menubg {
      position: absolute;
      pointer-events: none;
      visibility: hidden;

      &.fixed {
        position: fixed;
        bottom: 0;
        overflow: auto;
      }

      &.active {
        pointer-events: inherit;
        visibility: visible;
        z-index: $menuActive;
      }
    }

    &.wrapper.active {
      z-index: $menuTitleActive;
    }

    &.shim {
      z-index: $menuShim;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.12);
    }
  }
</style>

{#if active}
  <span class="shim" on:click={hide} />
{/if}
<span class="wrapper" class:table class:active>
  <span
    class="titlebg"
    class:active
    class:bordered={bordered && !active}
    bind:this={titleBg}
    on:click={() => {
      if (bordered) {
        revealOrHide();
      } else {
        hide();
      }
    }}
    style="width: {titleWidth +
      horizPadding *
        2}px; left: {-horizPadding}px;
    top: {-vertPadding}px; bottom: {-vertPadding}px"
  />
  <span class:table bind:this={title} on:click={revealOrHide}>
    <slot name="title" />
  </span>
</span>

<span
  class="menubg"
  class:active
  class:fixed
  on:click={hide}
  bind:this={menu}
  style="left: {menuLeft}px; top: {menuTop - MENU_OFFSET}px"
>
  {#if badge}
    <span class="badge">{badge}</span>
  {/if}
  <slot />
</span>

<svelte:window on:resize={handleResize} />
