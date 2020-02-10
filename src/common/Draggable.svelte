<script>
  import emitter from "@/emit";

  const emit = emitter({
    files() {}
  });

  let dragging = false;

  function filterFiles(files) {
    files = Array.from(files).filter(f => f.type == "application/pdf");
    return files;
  }

  function enter(e) {
    const files = filterFiles(e.dataTransfer.files);
    if (files.length == 0) return;
    dragging = true;
  }

  function leave() {
    dragging = false;
  }

  function handleDrop(e) {
    handleFiles(e.dataTransfer.files);
  }

  function handleFiles(files) {
    leave();
    // Filter for just PDF files
    files = filterFiles(files);
    if (files.length == 0) return;
    emit.files(files);
  }
</script>

<style lang="scss">
  .outer {
    display: table;
    width: 100%;
    height: 100%;
    position: relative;

    :global(.upload) {
      height: 150px;
      width: 100%;
      display: table-cell;
      vertical-align: middle;
      padding: 20px;
      box-sizing: border-box;
      text-align: center;
      font-weight: bold;
      background: #fffafb;
      color: black;
      transition: all 0.2s ease;
      border-radius: 6px;
    }

    :global(input[type="file"]) {
      position: absolute;
      left: 0;
      width: 100%;
      top: 0;
      bottom: 0;
      opacity: 0;
      cursor: pointer;

      &:hover + :global(.upload),
      &.dragging + :global(.upload) {
        background: #fc4762;
        color: white;
      }
    }
  }
</style>

<div
  class="outer"
  class:dragging
  on:dragenter|preventDefault={enter}
  on:dragover|preventDefault={enter}
  on:dragleave|preventDefault={leave}
  on:drop|preventDefault={handleDrop}>
  <slot />
</div>
