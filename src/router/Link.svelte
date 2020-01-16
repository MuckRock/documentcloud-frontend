<script>
  import { routes, router } from "@/router/router";
  export let to;
  export let params = null;
  export let newPage = false;

  function getPath() {
    let path = routes.lookup(to);
    if (params != null) {
      for (const param in params) {
        if (params.hasOwnProperty(param)) {
          path = path.replace(`:${param}`, params[param]);
        }
      }
    }
    return path;
  }

  $: toPath = getPath();
  $: active = $router.resolvedRoute.name == to;

  function nav(e) {
    // Don't programmatically nav if any modifier key is pressed
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;

    e.preventDefault();

    // change current router path
    router.currentUrl = toPath;
    // push the path into web browser history API
    window.history.pushState(
      { path: toPath },
      "",
      window.location.origin + toPath
    );
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
