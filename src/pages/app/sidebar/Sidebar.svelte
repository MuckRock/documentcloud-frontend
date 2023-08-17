<script>
  import emitter from "@/emit.js";

  // Components
  import Hamburger from "@/common/Hamburger.svelte";
  import Logo from "@/common/Logo.svelte";

  import ProjectFilters from "./ProjectFilters.svelte";
  import Projects from "./Projects.svelte";
  import OrgUsers from "./OrgUsers.svelte";

  import AddonSidebar from "../../../addons/sidebar/Sidebar.svelte";

  export let expanded;

  const emit = emitter({
    retractSidebar() {},
  });
</script>

<style>
  .sidebar {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    overflow: auto;
    width: var(--sidebar-width, 272px);
    -webkit-overflow-scrolling: touch;
  }

  .sidebarbg {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: var(--sidebarBg);
    width: var(--sidebar-width, 272px);
    background: var(--sidebar, #edeeef);
    box-shadow: 2px 0px 4px rgba(0, 0, 0, 0.12);
  }

  .sidebar header {
    padding: 20px 0;
  }

  @media only screen and (max-width: 720px) {
    .sidebar {
      display: none;
      width: 100vw;
      overflow-y: auto;
      height: 100%;
    }

    .sidebarbg {
      width: 100vw;
      box-shadow: none;
    }

    .sidebar.expanded {
      display: block;
      position: fixed;
    }
  }
</style>

<aside class="sidebar" class:expanded>
  <header>
    <Hamburger on:toggle={emit.retractSidebar} />
    <Logo />
  </header>

  <ProjectFilters />
  <OrgUsers />
  <Projects on:retractSidebar={emit.retractSidebar} />

  <AddonSidebar />

  <!-- todo get rid of this -->
  <div class="sidebarbg" />
</aside>
