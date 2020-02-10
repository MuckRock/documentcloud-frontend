<script>
  import { onMount, tick } from "svelte";

  const MENU_ITEM_HORIZ_PADDING = 5;
  const MENU_ITEM_VERT_PADDING = 10;
  const MENU_OFFSET = 1; // vert offset for menu

  export let table;

  let active = false;

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
    titleWidth = title.getBoundingClientRect().width;

    menuLeft = 0;
    menuTop = 0;

    await tick();

    // Set menu dimensions relative to title background
    const titleBgRect = titleBg.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    menuLeft = titleBgRect.x - menuRect.x;
    menuTop = titleBgRect.y + titleBgRect.height - menuRect.y;
  }

  async function handleResize() {
    hide();
    await computeSizes();
  }

  onMount(async () => {
    await computeSizes();
  });
</script>

<style lang="scss">
  span {
    display: inline-block;
    position: relative;

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
    }

    &.menubg {
      position: absolute;
      pointer-events: none;
      visibility: hidden;

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
    bind:this={titleBg}
    on:click={hide}
    style="width: {titleWidth + MENU_ITEM_HORIZ_PADDING * 2}px; left: {-MENU_ITEM_HORIZ_PADDING}px;
    top: {-MENU_ITEM_VERT_PADDING}px; bottom: {-MENU_ITEM_VERT_PADDING}px" />
  <span class:table bind:this={title} on:click={revealOrHide}>
    <slot name="title" />
  </span>
</span>

<span
  class="menubg"
  class:active
  on:click={hide}
  bind:this={menu}
  style="left: {menuLeft}px; top: {menuTop - MENU_OFFSET}px">
  <slot />
</span>

<svelte:window on:resize={handleResize} />
