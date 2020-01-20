<script>
  import { routes, router, getPath, pushUrl } from "@/router/router";
  export let to;
  export let params = null;
  export let newPage = false;

  $: toPath = getPath(to, params);
  $: active = $router.resolvedRoute.name == to;

  function nav(e) {
    // Don't programmatically nav if any modifier key is pressed
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;

    e.preventDefault();

    pushUrl(toPath);
  }
</script>

<style>
  .active {
    font-weight: bold;
  }
</style>

{#if newPage}
  <a class:active href={toPath} target="_blank">
    <slot />
  </a>
{:else}
  <a class:active href={toPath} on:click={nav}>
    <slot />
  </a>
{/if}
