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
        @pollDocument="pollDocument($event)"
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
      this.documents = (await Vue.API.getAllDocuments(null)) || [];
      this.documents.forEach(doc => {
        if (doc.pending) this.pollDocument(doc.id);
      });
      await Vue.API.getMe();
      this.loadingDocs = false;
    },
    async handleDelete(doc) {
      doc.loading = true;
      await Vue.API.deleteDocument(null, doc);

      for (let i = 0; i < this.documents.length; i++) {
        // Remove document.
        if (this.documents[i].id == doc.id) {
          this.documents.splice(i, 1);
          return;
        }
      }
    },
    async pollDocument(id) {
      Vue.API.pollDocument(
        id,
        newDoc => {
          // Replace new doc
          for (let i = 0; i < this.documents.length; i++) {
            const pDoc = this.documents[i];
            if (pDoc.id == id) {
              // Update document in-place
              this.$set(this.documents, i, newDoc);
              return;
            }
          }
          // Document wasn't found
          this.documents.push(newDoc);
        },
        doc => {
          // Set doc to be done processing without removing it
          doc.currentProcessingFinished = true;
        }
      );
    },
    handleDocFinishedProcessing(doc) {
      this.documents.push(doc);
    }
  }
};
</script>
