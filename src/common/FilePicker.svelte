<script>
  import emitter from "@/emit";

  const emit = emitter({
    files() {}
  });

  export let multiselect = false;

  let hover = false;

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
      emit.files(files);
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
    accept="application/pdf"
    on:change={handleFiles} />
</span>
