<script>
  import { router, Router } from "@/router/router";
  import { routes } from "@/routes";
  import { onMount } from "svelte";

  // Patch poll events
  import "@/ticker/ticker";

  // Set up routes
  router.routes = new Router(...routes);

  onMount(() => {
    router.currentUrl = window.location.pathname;
    if (!history.state) {
      window.history.replaceState(
        { path: window.location.pathname },
        "",
        window.location.href
      );
    }
  });

  function handleBackNav(e) {
    router.currentUrl = e.state.path;
  }
</script>

<style lang="scss">
  :global(input) {
    padding: 4px 10px;
    font-family: inherit;
    font-size: 16px;
    border-radius: 3px;
    border: solid 1px gainsboro;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.06);
  }
</style>

<svelte:window on:popstate={handleBackNav} />

{#if $router.resolvedRoute != null}
  <svelte:component
    this={$router.resolvedRoute.component}
    {...$router.resolvedRoute.props} />
{/if}
