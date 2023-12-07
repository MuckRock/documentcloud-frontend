<script>
  // import { Svue } from "svue";
  import { currentUrl, getPath, pushUrl, goBack } from "./router.js";
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

  $: href = back ? null : getPath(to, params);
  $: active = $currentUrl && urlsEqual($currentUrl, toUrl, plusReplace);

  function nav(e) {
    if (back) {
      goBack();
    }

    if (href == null || forceClick) return;

    // Don't programmatically nav if any modifier key is pressed
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;

    e.preventDefault();

    pushUrl(href);
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
    <a class:color class:ib={inlineBlock} class:active {href} target="_blank">
      <slot />
    </a>
  {:else}
    <a class:color class:ib={inlineBlock} class:active {href} on:click={nav}>
      <slot />
    </a>
  {/if}
{:else}
  <!-- Go back on click -->
  <a class:color class:ib={inlineBlock} class:active {href} on:click={nav}>
    <slot />
  </a>
{/if}
