<script>
  import emitter from "@/emit";
  import { filterFiles } from "./fileHandler";

  const emit = emitter({
    files() {},
  });

  export let multiselect = false;

  const documentTypes = process.env.DOCUMENT_TYPES.split(",")
    .map((x) => `.${x.toLowerCase().trim()}`)
    .join(",");

  // Bound to the file picker input
  let picker;

  function trigger() {
    picker.click();
  }

  function handleFiles() {
    const fileList = picker.files;
    if (fileList.length > 0) {
      // Clone the file list so the input can be safely cleared
      const files = [];
      for (let i = 0; i < fileList.length; i++) {
        files.push(fileList[i]);
      }
      emit.files(filterFiles(files));
    }
    picker.value = null;
  }
</script>

<style lang="scss">
  .container {
    display: inline-block;
    position: relative;
  }

  .picker {
    display: none;
  }

  .content {
    display: inline-block;
  }
</style>

<span class="container">
  <span class="content" on:click={trigger}>
    <slot />
  </span>
  <input
    multiple={multiselect}
    bind:this={picker}
    class="picker"
    type="file"
    on:change={handleFiles}
    accept={documentTypes} />
</span>
