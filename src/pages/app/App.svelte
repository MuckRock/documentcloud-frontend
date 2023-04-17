<script>
  import { onMount } from "svelte";
  import Sidebar from "./sidebar/Sidebar";
  import MainContainer from "./MainContainer";
  import { _ } from "svelte-i18n";

  import { layout } from "@/manager/layout";
  import { documents } from "@/manager/documents";
  import { orgsAndUsers } from "@/manager/orgsAndUsers.js";

  let sidebar = null;

  function setSidebarExpanded(expanded) {
    layout.sidebarExpanded = expanded;

    if (typeof window !== "undefined" && window.plausible) {
      plausible("app-sidebar-expand", { props: { expanded } });
    }
  }

  onMount(() => {
    window.plausible =
      window.plausible ||
      function () {
        (window.plausible.q = window.plausible.q || []).push(arguments);
      };

    plausible("pageview");
  });
</script>

<svelte:head>
  <title>{$_("common.documentCloud")}</title>

  {#if $orgsAndUsers.me !== null}<script
      defer
      data-domain="documentcloud.org"
      src="https://plausible.io/js/script.manual.tagged-events.js"></script>{/if}
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
    documents={$documents.documents}
    loading={$layout.loading}
    error={$layout.error}
  />
</div>
