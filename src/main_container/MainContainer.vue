<template>
  <div class="main">
    <Modal
      v-if="$extensions.confirmDialog.open"
      :component="ConfirmDialog"
      @close="$extensions.confirmDialog.hideConfirm()"
    />
    <Hamburger
      @toggle="$emit('expandSidebar')"
      bg="white"
      style="margin-top: 16px; padding: 1.5em 36px;"
    />
    <div class="container" v-if="!loadingError">
      <SearchBar @search="filter = $event" />
      <Documents
        :loadingDocuments="loadingDocuments"
        :documents="documents"
        :filter="filter"
        @delete="$emit('delete', $event)"
        @pollDocument="$emit('pollDocument', $event)"
        @docFinishedProcessing="$emit('docFinishedProcessing', $event)"
      />
    </div>
    <div class="container error" v-if="loadingError">
      <p class="status">Error</p>
      <p>
        We could not reach the DocumentCloud server. Please try refreshing the
        page later.
      </p>
      <div>
        <Button :secondary="true" @click="refresh()">Refresh</Button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main {
  position: absolute;
  left: $sidebar-width;
  right: 0;
  top: 0;

  @media only screen and (max-width: 600px) {
    left: 0;
  }
}

.container {
  padding: 36px 48px;

  &.error {
    padding: 100px;

    .status {
      color: $caution;
      font-weight: bold;
    }
  }
}
</style>

<script>
import SearchBar from "./SearchBar";
import Documents from "./Documents";
import Hamburger from "../common/Hamburger";
import Button from "../common/Button";
import Modal from "../common/Modal";

import ConfirmDialog from "./ConfirmDialog";

export default {
  components: {
    SearchBar,
    Documents,
    Hamburger,
    Button,
    Modal
  },
  data() {
    return {
      filter: "",
      ConfirmDialog
    };
  },
  props: {
    documents: Array,
    loadingDocuments: Boolean,
    loadingError: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    refresh() {
      window.location.reload();
    }
  }
};
</script>
