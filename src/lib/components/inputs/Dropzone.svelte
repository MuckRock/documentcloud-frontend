<!-- 
  @component
  Dropzone is a component that handles the uploading of files,
  passing dropped files to a provided handler.
  It is intended to provide a minimum of functionality, as detailed in
  https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications#selecting_files_using_drag_and_drop
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  interface Props {
    onDrop: (files: FileList) => void;
    active?: boolean;
    disabled?: boolean;
    children?: Snippet<[any]>;
  }

  let {
    onDrop,
    active = $bindable(false),
    disabled = false,
    children,
  }: Props = $props();

  let dropDepth = 0;

  function enter(e: DragEvent) {
    e.preventDefault();
    if (disabled) return;
    dropDepth++;
    active = true;
  }

  function dragover(e: DragEvent) {
    e.preventDefault();
    active = true;
  }

  function leave(e: DragEvent) {
    e.preventDefault();
    if (disabled) return;
    dropDepth--;
    if (dropDepth > 0) return;
    active = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    if (disabled) return;
    const files = e.dataTransfer?.files;
    if (files) onDrop(files);
    active = false;
  }
</script>

<div
  role="button"
  tabindex="0"
  aria-dropeffect="execute"
  ondragenter={enter}
  ondragover={dragover}
  ondragleave={leave}
  ondrop={handleDrop}
>
  {@render children?.({ active, disabled })}
</div>

<style>
  div {
    flex: 1 1 auto;
    width: 100%;
    height: 100%;
    position: relative;
  }
</style>
