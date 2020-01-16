<script>
  import { globalState } from "@/globalstate/globalstate";
  import { onMount } from "svelte";

  onMount(() => {
    globalState.router.currentUrl = window.location.pathname;
    if (!history.state) {
      window.history.replaceState(
        { path: window.location.pathname },
        "",
        window.location.href
      );
    }
  });

  function handleBackNav(e) {
    globalState.router.currentUrl = e.state.path;
  }
</script>

<svelte:window on:popstate={handleBackNav} />

<svelte:component
  this={$globalState.router.resolvedRoute.component}
  {...$globalState.router.resolvedRoute.props} />
