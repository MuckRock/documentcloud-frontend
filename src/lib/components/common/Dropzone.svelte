<!-- Dropzone is a component that handles the uploading of files,
     passing dropped files to a provided handler.
     It is intended to provide a minimum of functionality, as detailed in
     https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications#selecting_files_using_drag_and_drop
-->
<script lang="ts">
  export let onDrop: (files: FileList) => void;
  export let active = false;
  export let disabled = false;

  function enter() {
    if (disabled) return;
    active = true;
  }

  function leave() {
    if (disabled) return;
    active = false;
  }

  function handleDrop(e: DragEvent) {
    if (disabled) return;
    onDrop(e.dataTransfer.files);
    active = false;
  }
</script>

<div
  role="button"
  tabindex="0"
  aria-dropeffect="execute"
  on:dragenter|preventDefault={enter}
  on:dragover|preventDefault={enter}
  on:dragleave|preventDefault={leave}
  on:drop|preventDefault={handleDrop}
>
  <slot {active} {disabled} />
</div>

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>
