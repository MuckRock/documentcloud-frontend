<script>
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import Sidebar from "./sidebar/Sidebar.svelte";
  import MainContainer from "./MainContainer.svelte";

  import { layout } from "../../manager/layout.js";
  import { getAddonByRepository } from "../../manager/addons.js";
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
        layout.addonBrowserOpen = false;
      },
    ],

    // list add-ons
    [
      /^#add-ons$/,
      async (match) => {
        // await getBrowserAddons();
        layout.addonBrowserOpen = true;
      },
    ],

    // add-on runs
    [
      /^#add-ons\/runs$/,
      async (match) => {
        // await getBrowserAddons();
        layout.addonRunsOpen = true;
      },
    ],

    // initial add-on view
    [
      /^#add-ons\/([-\w]+)\/([-\w]+)$/,
      async (match) => {
        const [org, name] = match.slice(1, 3);
        const repo = `${org}/${name}`;
        const addon = await getAddonByRepository(repo);
        if (addon) {
          layout.addonDispatchOpen = addon;
          layout.params.addOnEvent = null;
        } else {
          console.error("Add-on not found: %s", repo);
        }
      },
    ],

    // configured add-on
    [
      /^#add-ons\/(?<org>[-\w]+)\/(?<name>[-\w]+)\/(?<id>\d+)$/,
      async (match) => {
        const [org, name, id] = match.slice(1, 4);
        const repo = `${org}/${name}`;
        const addon = await getAddonByRepository(repo);
        if (addon) {
          layout.addonDispatchOpen = addon;
          layout.params.addOnEvent = +id;
        } else {
          console.error("Add-on not found: %s", repo);
        }
      },
    ],
  ];

  let sidebar = null;

  // add-on ui
  let addons = {
    browser: undefined,
    dispatch: undefined,
    runs: undefined,
  };

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
    window.addons = addons;
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

<div>
  <Sidebar
    bind:this={sidebar}
    on:retractSidebar={() => setSidebarExpanded(false)}
    expanded={$layout.sidebarExpanded}
  />
  <MainContainer
    on:expandSidebar={() => setSidebarExpanded(true)}
    concealed={$layout.sidebarExpanded}
  />
</div>

<Browser visible={layout.addonBrowserOpen} bind:this={addons.browser} />

<Dispatch visible={layout.addonDispatchOpen} bind:this={addons.dispatch} />

<Runs visible={layout.addonRunsOpen} bind:this={addons.runs} />
