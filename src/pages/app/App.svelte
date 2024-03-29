<script>
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";

  // main app
  import Sidebar from "./sidebar/Sidebar.svelte";
  import MainContainer from "./MainContainer.svelte";

  // projects ui
  import ProjectBrowser from "../../projects/Browser.svelte";

  // new add-ons ui
  import Browser from "../../addons/browser/Browser.svelte";
  import Dispatch from "../../addons/dispatch/Dispatch.svelte";
  import Runs from "../../addons/runs/Runs.svelte";

  import { setHash, router } from "../../router/router.js";
  import { hideProjectBrowser, layout } from "../../manager/layout.js";
  import { orgsAndUsers } from "../../manager/orgsAndUsers.js";

  // hash routing, like in Viewer.svelte
  // [regexp, callback]
  const navHandlers = [
    [
      /^#$/,
      (match) => {
        $layout.addonBrowserOpen = false;
        $layout.addonDispatchOpen = false;
        $layout.addonRunsOpen = false;
      },
    ],

    // list add-ons
    [
      /^#add-ons$/,
      async (match) => {
        $layout.addonRunsOpen = false;
        $layout.addonDispatchOpen = false;
        $layout.addonBrowserOpen = true;
      },
    ],

    // add-on runs
    [
      /^#add-ons\/runs$/,
      async (match) => {
        $layout.addonBrowserOpen = false;
        $layout.addonDispatchOpen = false;
        $layout.addonRunsOpen = true;
      },
    ],

    // initial add-on view
    [
      /^#add-ons\/([-\w]+)\/([-\w]+)$/,
      async (match) => {
        $layout.addonBrowserOpen = false;
        $layout.addonRunsOpen = false;
        //$layout.addonDispatchOpen = false; // close first, open below

        const [org, name] = match.slice(1, 3);
        const repo = `${org}/${name}`;

        await dispatch.open(repo);
      },
    ],

    // configured add-on
    [
      /^#add-ons\/(?<org>[-\w]+)\/(?<name>[-\w]+)\/(?<id>\d+)$/,
      async (match) => {
        $layout.addonBrowserOpen = false;
        $layout.addonRunsOpen = false;
        // $layout.addonDispatchOpen = false; // close first, open below

        const [org, name, id] = match.slice(1, 4);
        const repo = `${org}/${name}`;

        await dispatch.open(repo, id);
      },
    ],
  ];

  // add-on ui
  let browser;
  let dispatch;
  let runs;

  function closeDrawer(e) {
    setHash("");
  }

  async function hashRoute() {
    const hash = window.location.hash;
    if (hash === "") {
      const callback = navHandlers[0][1];
      return callback();
    }

    navHandlers.find(([route, callback]) => {
      const match = route.exec(hash);
      if (match) {
        callback(match);
        return true; // stop the loop
      }
    });
  }

  onMount(() => {
    window.plausible =
      window.plausible ||
      function () {
        (window.plausible.q = window.plausible.q || []).push(arguments);
      };

    window.plausible && plausible("pageview");
    hashRoute();

    // debug
    window.layout = layout;
    window.addons = {
      browser,
      dispatch,
      runs,
      check() {
        console.log(`Browser: ${browser.visible}`);
        console.log(`Dispatch: ${dispatch.visible}`);
        console.log(`Runs: ${runs.visible}`);
      },
    };
  });
</script>

<svelte:window on:hashchange={hashRoute} />

<svelte:head>
  <title>{$_("common.documentCloud")}</title>

  {#if $orgsAndUsers.me !== null}<script
      defer
      data-domain="documentcloud.org"
      src="https://plausible.io/js/script.manual.tagged-events.js"
    ></script>{/if}
</svelte:head>

<div class="app-layout">
  <Sidebar />
  <main><MainContainer /></main>
</div>

<ProjectBrowser
  bind:visible={$layout.projectBrowser}
  on:close={hideProjectBrowser}
/>

<Browser
  bind:visible={$layout.addonBrowserOpen}
  bind:this={browser}
  on:close={closeDrawer}
/>

<Dispatch
  bind:visible={$layout.addonDispatchOpen}
  bind:this={dispatch}
  on:close={closeDrawer}
/>

<Runs
  bind:visible={$layout.addonRunsOpen}
  bind:this={runs}
  on:close={closeDrawer}
/>

<style>
  .app-layout {
    display: flex;
    height: 100vh;
  }

  .app-layout main {
    flex: 1 1 auto;
    background: var(--white);
    overflow: auto;
  }
</style>
