<script>
  import { router, Router } from "@/router/router";
  import { routes } from "@/routes";
  import { onMount } from "svelte";
  import { currentUrl } from "@/util/url";
  import Empty from "./pages/home/Empty.svelte";

  // Patch poll events
  import "@/ticker/ticker";

  // Set up routes
  router.routes = new Router(...routes);

  $: routeComponent =
    ($router.resolvedRoute || { component: Empty }).component || Empty;
  $: routeProps = ($router.resolvedRoute || { props: [] }).props || {};

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
    if (e.state == null) return;
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

  :global(details.dc summary) {
    outline: none;
    user-select: none;
    cursor: pointer;
    font-size: 10px;
    color: $gray;
    margin: 0 -10px;
  }

  :global(.sticky) {
    position: sticky;
    top: 0;

    @media only screen and (max-height: 600px) {
      position: relative;
    }
  }

  :global(.vheader) {
    overflow: hidden;
    width: 100%;
    text-shadow: 0 1px 0 #ddd;
    background: #c2c2c2;
    background: linear-gradient(#dfdfdf, #c2c2c2);

    :global(.vcontent) {
      display: table;
      width: 100%;

      :global(svg) {
        display: block;
      }
    }

    :global(select) {
      @include buttonLike;

      background: rgba(white, 0.7);
      border-radius: 3px;
      font-family: inherit;
      color: rgba(0, 0, 0, 0.8);
      font-size: 15px;
      outline: none;
      border: none;
      padding: 3px 20px 3px 8px;
      appearance: none;

      background-image: url("data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii01IDAgMjAgNiI+PHBhdGggZD0iTTEwIDBMNSA2IDAgMGgxMHoiIGZpbGw9IiM1MzUyNTIiLz48L3N2Zz4K");
      background-size: 21px 11px;
      background-repeat: no-repeat;
      background-position: right center;
    }
  }

  :global(a) {
    color: inherit;
    text-decoration: inherit;

    &.active {
      font-weight: normal !important;

      .project {
        $activeBg: $primary-faded;

        background: $activeBg;

        &:hover {
          background: $activeBg;
          opacity: 1;
        }
      }
    }
  }
</style>

<svelte:window on:popstate={handleBackNav} />

{#if $router.resolvedRoute != null}
  <svelte:component this={routeComponent} {...routeProps} />
{/if}
