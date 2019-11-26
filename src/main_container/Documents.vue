<template>
  <Loader :active="loadingDocuments">
    <div class="documents">
      <Modal
        v-if="uploading"
        @close="uploading = false"
        :component="UploadDialog"
        :properties="{ initialFiles: preUploadFiles }"
        @allUploaded="handleAllUploaded()"
        @docUploaded="handleDocUploaded($event)"
      ></Modal>
      <div>
        <Title>Your documents</Title>
        <Button @click="showUploadModal()">+ Upload</Button>
      </div>
      <Processing
        v-if="processingDocs.length > 0"
        :docs="processingDocs"
        @dismiss="clearProcessing()"
      />
      <Draggable class="docscontainer" @upload="showUploadModal($event)">
        <Document
          v-for="document in filteredDocs"
          :key="document.id"
          :document="document"
          @delete="$emit('delete', $event)"
        />
        <NoDocuments v-if="documents.length == 0 && !loadingDocuments" />
        <div class="toastouter">
          <div class="toast">Drop file to upload</div>
        </div>
      </Draggable>
    </div>
  </Loader>
</template>

<script>
import Document from "./Document";
import UploadDialog from "./UploadDialog";
import Processing from "./Processing";
import NoDocuments from "./NoDocuments";
import Title from "../common/Title";
import Button from "../common/Button";
import Modal from "../common/Modal";
import Draggable from "../common/Draggable";
import Loader from "../common/Loader";

import Vue from "vue";

export default {
  components: {
    Document,
    Title,
    Button,
    Modal,
    Draggable,
    Processing,
    NoDocuments,
    Loader
  },
  props: {
    documents: Array,
    filter: String,
    loadingDocuments: Boolean
  },
  data() {
    return {
      preUploadFiles: [],
      uploading: false,
      processingDocs: [],
      UploadDialog,
      processingStale: false
    };
  },
  computed: {
    filteredDocs() {
      if (this.filter == null || this.filter.trim() == "") {
        return this.documents;
      }
      return this.documents.filter(doc => {
        return doc.title.toLowerCase().indexOf(this.filter.toLowerCase()) != -1;
      });
    }
  },
  methods: {
    showUploadModal(files) {
      if (files != null) {
        window.console.log(files);
        this.preUploadFiles = Array.from(files);
      } else {
        this.preUploadFiles = [];
      }
      this.uploading = true;
    },
    handleAllUploaded() {
      this.uploading = false;
      this.processingStale = true;
    },
    handleDocUploaded(id) {
      if (this.processingStale) {
        this.processingStale = false;
        this.clearProcessing();
      }

      Vue.API.pollDocument(
        id,
        newDoc => {
          // Replace new doc
          for (let i = 0; i < this.processingDocs.length; i++) {
            const pDoc = this.processingDocs[i];
            if (pDoc.id == id) {
              // Update document in-place
              this.$set(this.processingDocs, i, newDoc);
              return;
            }
          }
          // Document wasn't found
          this.processingDocs.push(newDoc);
        },
        doc => {
          // Remove doc
          for (let i = 0; i < this.processingDocs.length; i++) {
            const pDoc = this.processingDocs[i];
            if (pDoc.id == doc.id) {
              this.processingDocs.splice(i, 1);
              break;
            }
          }
          this.$emit("docFinishedProcessing", doc);
        }
      );
    },
    clearProcessing() {
      this.processingDocs = this.processingDocs.filter(
        doc => !doc.processingDone
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.docscontainer {
  margin-top: 17px;
  margin-left: -25px;
  position: relative;
  padding-bottom: 28px;

  &.dragging {
    &::after {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: $primary-faded;
      border: 2px solid $primary;
      pointer-events: none;
    }

    .toastouter {
      visibility: visible;
    }
  }
}

.toastouter {
  visibility: hidden;
  text-align: center;
  position: sticky;
  position: -webkit-sticky;
  bottom: 28px;
  z-index: 3;
  pointer-events: none;
}

.toast {
  position: sticky;
  position: -webkit-sticky;
  bottom: 5px;
  display: inline-block;
  background: $primary;
  color: white;
  border-radius: 3px;
  box-shadow: $overlay-shadow;
  padding: 13px 55px;
}
</style>
