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

  let subscriptions = [];
  let layoutObj = {};
  let documentsObj = {};
  onMount(() => {
    subscriptions = [
      layout.subscribe(() => (layoutObj = layout)),
      documents.subscribe(() => (documentsObj = documents))
    ];
  });

  onDestroy(() => {
    subscriptions.forEach(subscription => subscription());
  });
</script>

<div>
  <Sidebar
    bind:this={sidebar}
    on:retractSidebar={() => setSidebarExpanded(false)}
    expanded={layoutObj.sidebarExpanded} />
  <MainContainer
    on:expandSidebar={() => setSidebarExpanded(true)}
    concealed={layoutObj.sidebarExpanded}
    documents={documentsObj.documents}
    loading={layoutObj.loading}
    error={layoutObj.error} />
</div>
