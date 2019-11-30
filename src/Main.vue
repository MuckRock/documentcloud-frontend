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
        :loadingError="error"
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
import variables from "./scss/variables.scss";

export default {
  components: { Sidebar, MainContainer },
  data() {
    return {
      sidebarExpanded: false,
      projects: [],
      documents: [],
      loadingDocs: true,
      error: false
    };
  },
  async mounted() {
    try {
      await this.loadDocs();
    } catch (e) {
      this.error = true;
    }
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
      this.$extensions.confirm(
        "Confirm delete",
        "Proceeding will permanently delete this document. Do you wish to continue?",
        "Delete",
        variables.caution,
        async () => {
          doc.loading = true;
          await Vue.API.deleteDocument(null, doc);

          for (let i = 0; i < this.documents.length; i++) {
            // Remove document.
            if (this.documents[i].id == doc.id) {
              this.documents.splice(i, 1);
              return;
            }
          }
        }
      );
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
          this.documents.splice(0, 0, newDoc);
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
