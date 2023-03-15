<script>
  import emitter from "@/emit";

  // Components
  import Hamburger from "@/common/Hamburger";
  import Logo from "@/common/Logo";

  import ProjectFilters from "./ProjectFilters.svelte";
  import Projects from "./Projects.svelte";
  import OrgUsers from "./OrgUsers.svelte";

  export let expanded;

  const emit = emitter({
    retractSidebar() {},
  });
</script>

<style lang="scss" scoped>
  .sidebar {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    overflow: auto;
    width: $sidebar-width;
    // z-index: $sidebarZ;
    -webkit-overflow-scrolling: touch;
  }

  .sidebarbg {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: $sidebarBg;
    width: $sidebar-width;
    background: $sidebar;
    box-shadow: 2px 0px 4px rgba(0, 0, 0, 0.12);
  }

  .sidebar header {
    padding: 20px 0;
  }

  @media only screen and (max-width: $mobileBreak) {
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

  <!-- todo get rid of this -->
  <div class="sidebarbg" />
</aside>
