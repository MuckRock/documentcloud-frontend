<script>
  import { Svue } from "svue";
  import { router, getPath, pushUrl, goBack } from "./router.js";
  import { urlsEqual } from "../util/url.js";

  export let to = null;
  export let toUrl = null;
  export let back = false;
  export let params = null;
  export let newPage = false;
  export let forceClick = false;
  export let inlineBlock = false;
  export let color = false;
  export let plusReplace = false;

  const link = new Svue({
    data() {
      return { router };
    },
    computed: {
      toPath(router) {
        if (toUrl != null) return toUrl;
        if (router.routes == null) return null;
        if (back) return null;
        return getPath(to, params);
      },
      active(router) {
        if (router.routes == null) return false;
        if (toUrl != null) {
          return urlsEqual(router.currentUrl, toUrl, plusReplace);
        }
        return router.resolvedRoute.name == to;
      },
    },
  });

  function nav(e) {
    if (back) {
      goBack();
    }

    if (link.toPath == null || forceClick) return;

    // Don't programmatically nav if any modifier key is pressed
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;

    e.preventDefault();

    pushUrl(link.toPath);
  }
</script>

<style>
  .active {
    font-weight: bold;
  }

  .ib {
    display: inline-block;
  }

  .color {
    color: var(--primary) !important;
  }

  a {
    cursor: pointer;
  }
</style>

{#if !back}
  {#if newPage}
    <a
      class:color
      class:ib={inlineBlock}
      class:active={$link.active}
      href={$link.toPath}
      target="_blank"
    >
      <slot />
    </a>
  {:else}
    <a
      class:color
      class:ib={inlineBlock}
      class:active={$link.active}
      href={$link.toPath}
      on:click={nav}
    >
      <slot />
    </a>
  {/if}
{:else}
  <!-- Go back on click -->
  <a
    class:color
    class:ib={inlineBlock}
    class:active={$link.active}
    href={$link.toPath}
    on:click={nav}
  >
    <slot />
  </a>
{/if}
