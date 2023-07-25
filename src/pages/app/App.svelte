<script>
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import Sidebar from "./sidebar/Sidebar.svelte";
  import MainContainer from "./MainContainer.svelte";

  import { setHash } from "../../router/router.js";
  import { layout } from "../../manager/layout.js";
  import { orgsAndUsers } from "../../manager/orgsAndUsers.js";

  // new add-ons ui
  import Browser from "../../addons/browser/Browser.svelte";
  import Runs from "../../addons/runs/Runs.svelte";
  import Dispatch from "../../addons/dispatch/Dispatch.svelte";

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
        console.log("Opening add-on browser");
        $layout.addonRunsOpen = false;
        $layout.addonDispatchOpen = false;
        $layout.addonBrowserOpen = true;
      },
    ],

    // add-on runs
    [
      /^#add-ons\/runs$/,
      async (match) => {
        console.log("Showing runs");
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
        $layout.addonDispatchOpen = false; // close first, open below

        const [org, name] = match.slice(1, 3);
        const repo = `${org}/${name}`;

        await dispatch
          .open(repo)
          .then(() => console.log(`Loaded Dispatch: ${repo}`));
      },
    ],

    // configured add-on
    [
      /^#add-ons\/(?<org>[-\w]+)\/(?<name>[-\w]+)\/(?<id>\d+)$/,
      async (match) => {
        $layout.addonBrowserOpen = false;
        $layout.addonRunsOpen = false;
        $layout.addonDispatchOpen = false; // close first, open below

        const [org, name, id] = match.slice(1, 4);
        const repo = `${org}/${name}`;

        await dispatch
          .open(repo, id)
          .then(() => console.log(`Loaded Dispatch with event: ${repo}/${id}`));
      },
    ],
  ];

  let sidebar = null;

  // add-on ui
  let browser;
  let dispatch;
  let runs;

  function closeDrawer(e) {
    setHash("");
  }

  function setSidebarExpanded(expanded) {
    layout.sidebarExpanded = expanded;

    if (typeof window !== "undefined" && window.plausible) {
      plausible("app-sidebar-expand", { props: { expanded } });
    }
  }

  function hashRoute() {
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

    plausible("pageview");
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

<svelte:window on:hashchange={hashRoute} on:pushstate={hashRoute} />

<svelte:head>
  <title>{$_("common.documentCloud")}</title>

  {#if $orgsAndUsers.me !== null}<script
      defer
      data-domain="documentcloud.org"
      src="https://plausible.io/js/script.manual.tagged-events.js"
    ></script>{/if}
</svelte:head>

<Sidebar
  bind:this={sidebar}
  on:retractSidebar={() => setSidebarExpanded(false)}
  expanded={$layout.sidebarExpanded}
/>
<MainContainer
  on:expandSidebar={() => setSidebarExpanded(true)}
  concealed={$layout.sidebarExpanded}
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
