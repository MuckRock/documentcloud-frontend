<template>
  <div class="documents">
    <Modal v-if="uploading" @close="uploading = false">
      <UploadDialog />
    </Modal>
    <div>
      <Title>Your documents</Title>
      <Button @click="showUploadModal()">+ Upload</Button>
    </div>
    <Draggable class="docscontainer" @upload="showUploadModal($event)">
      <Document v-for="document in documents" v-bind:key="document.id" v-bind:document="document" />
      <div class="toastouter">
        <div class="toast">Drop file to upload</div>
      </div>
    </Draggable>
  </div>
</template>

<style scoped>
.docscontainer {
  margin-top: 17px;
  margin-left: -25px;
  position: relative;
}

.toastouter {
  visibility: hidden;
  text-align: center;
  position: sticky;
  position: -webkit-sticky;
  bottom: 58px;
  z-index: 3;
  pointer-events: none;
}

.toast {
  position: sticky;
  position: -webkit-sticky;
  bottom: 5px;
  display: inline-block;
  background: var(--primary);
  color: white;
  border-radius: 3px;
  box-shadow: var(--overlay-shadow);
  padding: 13px 55px;
}

.docscontainer.dragging::after {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: var(--primary-faded);
  border: 2px solid var(--primary);
  pointer-events: none;
}

.docscontainer.dragging .toastouter {
  visibility: visible;
}
</style>

<script>
import Document from "./Document";
import UploadDialog from "./UploadDialog";
import Title from "../common/Title";
import Button from "../common/Button";
import Modal from "../common/Modal";
import Draggable from "../common/Draggable";

export default {
  components: { Document, UploadDialog, Title, Button, Modal, Draggable },
  props: {
    documents: {
      type: Array
    }
  },
  data() {
    return {
      uploading: false
    };
  },
  methods: {
    showUploadModal() {
      this.uploading = true;
    }
  }
};
</script>