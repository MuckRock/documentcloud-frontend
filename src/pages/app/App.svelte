<script>
  import Sidebar from "./sidebar/Sidebar";
  import MainContainer from "./MainContainer";

  import { layout } from "@/manager/layout";
  import { documents } from "@/manager/documents";

  let sidebar = null;

  function setSidebarExpanded(expanded) {
    layout.sidebarExpanded = expanded;
  }
</script>

<svelte:head>
  <title>DocumentCloud</title>
</svelte:head>

<div>
  <Sidebar
    bind:this={sidebar}
    on:retractSidebar={() => setSidebarExpanded(false)}
    expanded={$layout.sidebarExpanded} />
  <MainContainer
    on:expandSidebar={() => setSidebarExpanded(true)}
    concealed={$layout.sidebarExpanded}
    documents={$documents.documents}
    loading={$layout.loading}
    error={$layout.error} />
</div>
