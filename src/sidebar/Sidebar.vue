<template>
  <div ref="sidebar" class="sidebar" :class="{expanded}">
    <Hamburger @toggle="$emit('retractSidebar')" bg="var(--sidebar)" style="padding: 25px;" />
    <Logo />
    <Projects v-bind:projects="projects" />
    <div class="sidebarbg"></div>
  </div>
</template>

<style scoped>
.sidebar {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  z-index: 10;
  -webkit-overflow-scrolling: touch;
}

.sidebarbg {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: -1;
  width: var(--sidebar-width);
  background: var(--sidebar);
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

<script>
import Logo from "./Logo";
import Projects from "./Projects";
import Hamburger from "../common/Hamburger";

export default {
  components: { Logo, Projects, Hamburger },
  props: {
    projects: Array,
    expanded: Boolean
  }
};
</script>