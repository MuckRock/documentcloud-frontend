<template>
  <keep-alive>
    <div>
      <Sidebar
        ref="sidebar"
        v-bind:projects="projects"
        :expanded="sidebarExpanded"
        @retractSidebar="setSidebarExpanded(false)"
      />
      <MainContainer
        @expandSidebar="setSidebarExpanded(true)"
        :documents="documents"
        :loadingDocuments="loadingDocs"
        @delete="handleDelete($event)"
        @docFinishedProcessing="handleDocFinishedProcessing($event)"
      />
    </div>
  </keep-alive>
</template>

<script>
import Sidebar from "./sidebar/Sidebar";
import MainContainer from "./main_container/MainContainer";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import Vue from "vue";

export default {
  components: { Sidebar, MainContainer },
  data() {
    return {
      sidebarExpanded: false,
      projects: [],
      documents: [],
      loadingDocs: true
    };
  },
  async mounted() {
    await this.loadDocs();
  },
  methods: {
    setSidebarExpanded(expanded) {
      this.sidebarExpanded = expanded;
      if (expanded) {
        disableBodyScroll(this.$refs.sidebar.$refs.sidebar);
      } else {
        enableBodyScroll(this.$refs.sidebar.$refs.sidebar);
      }
    },
    async loadDocs() {
      this.documents = (await Vue.API.getDocuments(null)) || [];
      await Vue.API.getMe();
      this.loadingDocs = false;
    },
    async handleDelete(doc) {
      doc.processing.loading = true;
      await Vue.API.deleteDocument(null, doc);

      for (let i = 0; i < this.documents.length; i++) {
        // Remove document.
        if (this.documents[i].id == doc.id) {
          this.documents.splice(i, 1);
          return;
        }
      }
    },
    handleDocFinishedProcessing(doc) {
      window.console.log("handle doc finished", doc);
      this.documents.push(doc);
    }
  }
};
</script>