<template>
  <div>
    <Sidebar
      v-bind:projects="projects"
      :expanded="sidebarExpanded"
      @retractSidebar="setSidebarExpanded(false)"
    />
    <MainContainer @expandSidebar="setSidebarExpanded(true)" :query="query" :documents="documents" />
  </div>
</template>

<style>
body {
  font-family: Source Sans Pro, sans-serif;
}

body.modalopen {
  overflow: hidden;
}

* {
  /* Colors */
  --primary: #4294f0;
  --primary-faded: rgba(66, 148, 240, 0.13);
  --sidebar: #edeeef;
  --black: #000000;
  --gray: rgba(0, 0, 0, 0.53);
  --modal: #323232;

  /* Shadows */
  --overlay-shadow: 2px 2px 4px rgba(0, 0, 0, 0.25);

  /* Opacity */
  --hover-opacity: 0.8;

  /* Sizes */
  --sidebar-width: 272px;
  --normal: 14px;
  --small: 12px;
  --radius: 3px;
}
</style>

<script>
import Sidebar from "./sidebar/Sidebar";
import MainContainer from "./main_container/MainContainer";
import data from "./data.js";

export default {
  components: { Sidebar, MainContainer },
  data() {
    return { ...data, sidebarExpanded: false };
  },
  methods: {
    setSidebarExpanded(expanded) {
      this.sidebarExpanded = expanded;
      if (expanded) {
        document.body.classList.add("modalopen");
      } else {
        document.body.classList.remove("modalopen");
      }
    }
  }
};
</script>