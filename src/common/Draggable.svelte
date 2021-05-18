<script>
  import emitter from "@/emit";
  import { filterFiles } from "./fileHandler";

  const emit = emitter({
    files() {},
  });

  let dragging = false;
  export let disabled = false;

  function enter(e) {
    if (disabled) return;
    dragging = true;
  }

  function leave() {
    if (disabled) return;
    dragging = false;
  }

  function handleDrop(e) {
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  }

  function handleFiles(files) {
    if (disabled) return;
    leave();
    files = filterFiles(Array.from(files));
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
  on:drop|preventDefault={handleDrop}
>
  <slot />
</div>
