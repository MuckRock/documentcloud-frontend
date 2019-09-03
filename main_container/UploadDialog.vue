<template>
  <div>
    <h1>Document Upload</h1>
    <p>Select or drag a .pdf document to begin the document upload process. You will then be able to edit document information.</p>
    <div class="actions">
      <FilePicker :multiselect="true" @files="handleFiles($event)">
        <Button>+ Select files</Button>
      </FilePicker>
    </div>
    <DropZone />
  </div>
</template>

<script>
import Button from "../common/Button";
import DropZone from "../common/DropZone";
import FilePicker from "../common/FilePicker";

export default {
  components: { Button, DropZone, FilePicker },
  methods: {
    handleFiles(e) {
      window.console.log("RECEIVED", e);
    }
  }
};
</script>

<style scoped>
.actions {
  margin: 1.5em 0;
}
</style>