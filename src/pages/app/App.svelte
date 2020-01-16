<script>
  import Sidebar from "./sidebar/Sidebar";
  import MainContainer from "./MainContainer";
  import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";

  import { layout } from "@/manager/layout";
  import { documents } from "@/manager/documents";
  import { projects } from "@/manager/projects";

  let sidebar = null;

  function setSidebarExpanded(expanded) {
    layout.sidebarExpanded = expanded;
    if (expanded) {
      disableBodyScroll(sidebar);
    } else {
      enableBodyScroll(sidebar);
    }
  }
</script>

<div>
  <Sidebar
    bind:this={sidebar}
    on:retractSidebar={() => setSidebarExpanded(false)} />
  <MainContainer
    on:expandSidebar={() => setSidebarExpanded(true)}
    documents={$documents.documents}
    loading={$layout.loading}
    error={$layout.error} />
</div>
