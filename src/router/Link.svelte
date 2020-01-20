<script>
  import { routes, router, getPath, pushUrl } from "@/router/router";
  import { Svue } from "svue";
  export let to;
  export let params = null;
  export let newPage = false;

  const link = new Svue({
    data() {
      return { router };
    },
    computed: {
      toPath(router) {
        if (router.routes == null) return null;
        return getPath(to, params);
      },
      active(router) {
        if (router.routes == null) return false;
        return router.resolvedRoute.name == to;
      }
    }
  });

  function nav(e) {
    if (link.toPath == null) return;

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
</style>

{#if newPage}
  <a class:active={$link.active} href={$link.toPath} target="_blank">
    <slot />
  </a>
{:else}
  <a class:active={$link.active} href={$link.toPath} on:click={nav}>
    <slot />
  </a>
{/if}
