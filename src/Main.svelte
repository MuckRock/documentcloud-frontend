<script>
  import "./style/variables.css";
  import "./style/global.css";

  import { onMount } from "svelte";
  import { isLoading } from "svelte-i18n";

  import Empty from "./pages/home/Empty.svelte";

  import { router } from "./router/router.js";
  import { routes } from "./routes.js";
  import { currentUrl } from "./util/url.js";
  import "./langs/i18n.js";

  // Patch poll events
  import "./ticker/ticker.js";

  // Set up routes
  router.notFound = routes[0];
  router.routeFunc = routes[1];

  $: routeComponent =
    ($router.resolvedRoute || { component: Empty }).component || Empty;
  $: routeProps = ($router.resolvedRoute || { props: [] }).props || {};

  onMount(() => {
    router.currentUrl = currentUrl();
    if (!history.state) {
      window.history.replaceState(
        { path: currentUrl() },
        "",
        window.location.href,
      );
    }

    // debug
    window.router = router;
  });

  function handleBackNav(e) {
    if (e.state == null) return;
    router.currentUrl = e.state.path;
  }
</script>

<svelte:window on:popstate={handleBackNav} />

<div>
  {#if $isLoading}
    Please wait...
  {:else if $router.resolvedRoute != null}
    <svelte:component this={routeComponent} {...routeProps} />
  {/if}
</div>
