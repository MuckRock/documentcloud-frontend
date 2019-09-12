<template>
  <div class="zoomsearch">
    <DocumentZoom @zoom="$emit('zoom', $event)" />
    <DocumentSearch />
  </div>
</template>

<style scoped>
.zoomsearch {
  text-align: right;
}
</style>

<script>
import DocumentZoom from "./DocumentZoom";
import DocumentSearch from "./DocumentSearch";

export default {
  components: { DocumentZoom, DocumentSearch }
};
</script>