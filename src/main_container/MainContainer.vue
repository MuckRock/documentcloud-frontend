<template>
  <div class="main">
    <Hamburger
      @toggle="$emit('expandSidebar')"
      bg="white"
      style="margin-top: 16px; padding: 1.5em 36px;"
    />
    <div class="container">
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
}
</style>

<script>
import SearchBar from "./SearchBar";
import Documents from "./Documents";
import Hamburger from "../common/Hamburger";

export default {
  components: {
    SearchBar,
    Documents,
    Hamburger
  },
  data() {
    return {
      filter: ""
    };
  },
  props: {
    documents: Array,
    loadingDocuments: Boolean
  }
};
</script>
