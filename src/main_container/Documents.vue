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
        @delete="$emit('delete', $event)"
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
      UploadDialog
    };
  },
  computed: {
    nonPendingDocs() {
      return this.documents.filter(doc => doc.nonPending && !doc.linger);
    },
    pendingDocs() {
      return this.documents.filter(doc => doc.pending);
    },
    processingDocs() {
      return this.documents.filter(
        doc => doc.pending || doc.currentProcessingFinished
      );
    },
    filteredDocs() {
      // TODO: use actual search
      if (this.filter == null || this.filter.trim() == "") {
        return this.nonPendingDocs;
      }
      return this.nonPendingDocs.filter(doc => {
        return doc.title.toLowerCase().indexOf(this.filter.toLowerCase()) != -1;
      });
    }
  },
  methods: {
    showUploadModal(files) {
      if (files != null) {
        this.preUploadFiles = Array.from(files);
      } else {
        this.preUploadFiles = [];
      }
      this.uploading = true;
    },
    handleAllUploaded() {
      this.uploading = false;
    },
    handleDocUploaded(id) {
      this.$emit("pollDocument", id);
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
