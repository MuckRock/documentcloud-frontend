<script>
  import { router, Router } from "@/router/router";
  import { routes } from "@/routes";
  import { onMount } from "svelte";
  import { currentUrl } from "@/util/url";

  // Patch poll events
  import "@/ticker/ticker";

  // Set up routes
  router.routes = new Router(...routes);

  onMount(() => {
    router.currentUrl = currentUrl();
    if (!history.state) {
      window.history.replaceState(
        { path: currentUrl() },
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
    border: solid 1px #d0d0d0;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.06);
  }

  :global(textarea) {
    min-height: 44px;
    max-height: 25vh;
    resize: none;
    border: 1px solid #d0d0d0;
    border-radius: $radius;
    font-size: 12px;
    width: 100%;
    padding: 2px 4px;
    box-sizing: border-box;
    outline: none;
  }

  :global(.dropper) {
    font-size: 0.6em;
    padding-left: 5px;
    transform: scaleY(0.8) translateY(-1px);
    display: inline-block;
  }
</style>

<svelte:window on:popstate={handleBackNav} />

{#if $router.resolvedRoute != null}
  <svelte:component
    this={$router.resolvedRoute.component}
    {...$router.resolvedRoute.props} />
{/if}
