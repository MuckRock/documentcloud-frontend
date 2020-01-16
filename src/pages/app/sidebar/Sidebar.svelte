<script>
  import { layout } from "@/manager/layout";
  import emitter from "@/emit";

  // Components
  import Hamburger from "@/common/Hamburger";
  import Logo from "@/common/Logo";
  import Projects from "./Projects";

  const emit = emitter({
    retractSidebar() {}
  });
</script>

<style lang="scss" scoped>
  .sidebar {
    position: absolute;
    top: 0;
    left: 0;
    width: $sidebar-width;
    z-index: $sidebarZ;
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

  @media only screen and (max-width: 600px) {
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

<div class="sidebar" class:expanded={$layout.expanded}>
  <Hamburger
    on:toggle={emit.retractSidebar}
    white={false}
    style="padding: 25px;" />
  <Logo />
  <Projects />
  <div class="sidebarbg" />
</div>
