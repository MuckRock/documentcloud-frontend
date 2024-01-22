<script>
  import { DOCUMENT_TYPES } from "../config/config.js";
  import emitter from "@/emit.js";
  import { filterFiles } from "./fileHandler.js";

  const emit = emitter({
    files() {},
  });

  export let multiselect = false;

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

<span class="container">
  <button class="content buttonLike" on:click={trigger}>
    <slot />
  </button>
  <input
    multiple={multiselect}
    bind:this={picker}
    class="picker"
    type="file"
    on:change={handleFiles}
    accept={DOCUMENT_TYPES.join(",")}
  />
</span>

<style>
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
