<script>
  import "./style/variables.css";
  import "./style/global.css";

  import { onMount } from "svelte";
  import { isLoading } from "svelte-i18n";

  import Empty from "./pages/home/Empty.svelte";

  import { currentUrl, resolvedRoute } from "./router/router.js";
  import { getCurrentUrl } from "./util/url.js";
  import "./langs/i18n.js";

  // Patch poll events
  import "./ticker/ticker.js";

  $: routeComponent =
    ($resolvedRoute || { component: Empty }).component || Empty;
  $: routeProps = ($resolvedRoute || { props: [] }).props || {};

  $: console.log($currentUrl);
  $: console.log($resolvedRoute);

  onMount(() => {
    $currentUrl = getCurrentUrl();
    if (!history.state) {
      window.history.replaceState(
        { path: getCurrentUrl() },
        "",
        window.location.href,
      );
    }
  });

  function handleBackNav(e) {
    if (e.state == null) return;
    $currentUrl = e.state.path;
  }
</script>

<svelte:window on:popstate={handleBackNav} />

<div>
  {#if $isLoading}
    Please wait...
  {:else if $resolvedRoute != null}
    <svelte:component this={routeComponent} {...routeProps} />
  {/if}
</div>
