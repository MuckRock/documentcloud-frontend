<template>
  <div class="documentcontrols">
    <DocumentMode :mode="mode" @mode="$emit('mode', $event)" />
    <DocumentZoom @zoom="$emit('zoom', $event)" />
    <DocumentSearch />
  </div>
</template>

<style scoped>
.documentcontrols {
  text-align: right;
}
</style>

<script>
import DocumentMode from "./DocumentMode";
import DocumentZoom from "./DocumentZoom";
import DocumentSearch from "./DocumentSearch";

export default {
  components: { DocumentMode, DocumentZoom, DocumentSearch },
  props: {
    mode: String
  }
};
</script>