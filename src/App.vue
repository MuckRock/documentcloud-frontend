
<template>
  <router-view></router-view>
</template>

<style lang="scss">
body {
  font-family: Source Sans Pro, sans-serif;

  &.modalopen {
    overflow: hidden;
  }
}

body,
html {
  margin: 0;
  padding: 0;
}
</style>

<script>
import Vue from "vue";
import Router from "vue-router";
Vue.use(Router);

// API apps
import ApiBase from "./api/base";
import Auth from "./api/auth";
import Document from "./api/document";
Vue.use(ApiBase);
Vue.use(Auth);
Vue.use(Document);

// Routes
import Home from "./home/Home";
import Main from "./Main.vue";
import DocumentViewer from "./document_viewer/DocumentViewer";

const router = new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      component: Home,
      name: "home"
    },
    { path: "/app", component: Main, name: "app" },
    { path: "/viewer/:id", component: DocumentViewer, name: "viewer" },
    { path: "*", redirect: "/404" }
  ]
});

export default {
  router
};
</script>