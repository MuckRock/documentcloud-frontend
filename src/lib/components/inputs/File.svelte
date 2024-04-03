<!-- @component
  The File input provides a styled wrapper around `<input type="file" />`.
  It mimics the way our common `Button` component handles displaying children.
-->

<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { DOCUMENT_TYPES } from "@/config/config.js";
  import Button from "$lib/components/common/Button.svelte";

  export let name: string = null;
  export let onFileSelect: (files: FileList) => void;
  export let multiple = false;
  export let buttonMode: ComponentProps<Button>["mode"] = "ghost";

  // Bound to the file picker input
  let picker: HTMLInputElement;

  function openFilePicker() {
    picker.click();
  }

  function handleFiles() {
    const fileList = picker.files;
    if (fileList.length > 0) {
      // Clone the file list so the input can be safely cleared
      const listCopy: FileList = Object.assign([], fileList);
      onFileSelect(listCopy);
    }
    picker.value = null;
  }
</script>

<span class="container">
  <Button mode={buttonMode} on:click={openFilePicker}>
    <slot />
  </Button>
  <input
    type="file"
    {name}
    accept={DOCUMENT_TYPES.join(",")}
    {multiple}
    bind:this={picker}
    on:change={handleFiles}
    class="picker"
  />
</span>

<style>
  .picker {
    display: none;
  }
</style>
