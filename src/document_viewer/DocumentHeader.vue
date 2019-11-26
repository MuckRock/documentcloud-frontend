<template>
  <header>
    <DocumentHamburgerTitle :doc="doc" />
    <DocumentPaging
      v-if="doc != null"
      @jump="$emit('jump', $event)"
      :currentPage="currentPage"
      :numPages="numPages"
    />
    <DocumentControls
      v-if="doc != null"
      @zoom="$emit('zoom', $event)"
      @mode="$emit('mode', $event)"
      :mode="mode"
    />
  </header>
</template>

<style lang="scss" scoped>
header {
  background: $primary;
  color: white;
  position: sticky;
  top: 0;
  height: $document-header-height;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

<script>
import DocumentHamburgerTitle from "./DocumentHamburgerTitle";
import DocumentPaging from "./DocumentPaging";
import DocumentControls from "./DocumentControls";

export default {
  components: {
    DocumentHamburgerTitle,
    DocumentPaging,
    DocumentControls
  },
  props: {
    numPages: Number,
    currentPage: Number,
    doc: Object,
    mode: String
  }
};
</script>
