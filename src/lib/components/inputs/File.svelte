<!-- @component
  The File input provides a styled wrapper around `<input type="file" />`.
  It mimics the way our common `Button` component handles displaying children.
-->

<script lang="ts">
  import type { ComponentProps, Snippet } from "svelte";
  import { DOCUMENT_TYPES } from "@/config/config.js";
  import Button from "$lib/components/common/Button.svelte";

  interface Props {
    name?: null | string;
    onFileSelect: (files: File[]) => void;
    multiple?: boolean;
    buttonMode?: ComponentProps<typeof Button>["mode"];
    files?: null | FileList;
    disabled?: boolean;
    children?: Snippet;
  }

  let {
    name = null,
    onFileSelect,
    multiple = false,
    buttonMode = "primary",
    files = $bindable(null),
    disabled = false,
    children,
  }: Props = $props();

  // Bound to the file picker input
  let picker: HTMLInputElement | undefined = $state();

  function openFilePicker() {
    picker?.click();
  }

  function handleFiles() {
    if (!picker) return;
    const fileList = picker.files;
    if (fileList && fileList.length > 0) {
      // Clone the file list so the input can be safely cleared
      onFileSelect(Array.from(fileList));
    }
    picker.value = "";
  }
</script>

<span class="container" class:disabled>
  <Button mode={buttonMode} onclick={openFilePicker} {disabled}>
    {@render children?.()}
  </Button>
  <input
    type="file"
    {name}
    accept={DOCUMENT_TYPES.join(",")}
    {multiple}
    {disabled}
    bind:files
    bind:this={picker}
    onchange={handleFiles}
    class="picker"
  />
</span>

<style>
  .picker {
    display: none;
  }
</style>
