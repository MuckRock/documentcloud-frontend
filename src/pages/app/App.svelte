<script>
  import Sidebar from "./sidebar/Sidebar";
  import MainContainer from "./MainContainer";

  import { layout } from "@/manager/layout";
  import { documents } from "@/manager/documents";
  import { onMount, onDestroy } from "svelte";

  let sidebar = null;

  function setSidebarExpanded(expanded) {
    layout.sidebarExpanded = expanded;
  }

  let reactiveLayout = {};
  let reactiveDocuments = {};
  let unsubscriptions = [];

  onMount(() => {
    unsubscriptions = [
      layout.subscribe(() => (reactiveLayout = layout || {})),
      documents.subscribe(() => (reactiveDocuments = documents || {}))
    ];
  });
</script>

<div>
  <Sidebar
    bind:this={sidebar}
    on:retractSidebar={() => setSidebarExpanded(false)}
    expanded={reactiveLayout.sidebarExpanded} />
  <MainContainer
    on:expandSidebar={() => setSidebarExpanded(true)}
    concealed={reactiveLayout.sidebarExpanded}
    documents={reactiveDocuments.documents}
    loading={reactiveLayout.loading}
    error={reactiveLayout.error} />
</div>
