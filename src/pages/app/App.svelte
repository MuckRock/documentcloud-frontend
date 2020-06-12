<script>
  import Sidebar from "./sidebar/Sidebar";
  import MainContainer from "./MainContainer";

  import { layout } from "@/manager/layout";
  import { documents } from "@/manager/documents";
  import { projects } from "@/manager/projects";

  let sidebar = null;

  function setSidebarExpanded(expanded) {
    layout.sidebarExpanded = expanded;
  }

  function attempt(fn) {
    try {
      return fn();
    } catch (e) {
      return null;
    }
  }
</script>

<div>
  <Sidebar
    bind:this={sidebar}
    on:retractSidebar={() => setSidebarExpanded(false)}
    expanded={attempt(() => $layout.sidebarExpanded)} />
  <MainContainer
    on:expandSidebar={() => setSidebarExpanded(true)}
    concealed={attempt(() => $layout.sidebarExpanded)}
    documents={attempt(() => $documents.documents)}
    loading={attempt(() => $layout.loading)}
    error={attempt(() => $layout.error)} />
</div>
