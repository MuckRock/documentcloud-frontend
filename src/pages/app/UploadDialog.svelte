<script>
  // Components
  import File from "./File";
  import Button from "@/common/Button";
  import DropZone from "@/common/DropZone";
  import FilePicker from "@/common/FilePicker";

  // API
  import { uploadDocuments } from "@/api/document";

  // Stores
  import { layout } from "@/manager/layout";
  import { handleNewDocument } from "@/manager/documents";

  import { onMount } from "svelte";
  import emitter from "@/emit";

  const emit = emitter({
    setDismissable() {}
  });

  export let initialFiles = [];

  let files = [];
  let id = 0;
  let uploadMode = false;
  let uploadFiles = [];
  let uploadAdditional = false;
  let errorMessage = null;

  $: displayFiles = uploadMode == false ? files : uploadFiles;

  let numUploaded;
  $: {
    // Set numUploaded
    if (!uploadMode) {
      numUploaded = 0;
    } else {
      let total = 0;
      for (let i = 0; i < uploadFiles.length; i++) {
        total += uploadFiles[i].done ? 1 : 0;
      }
      numUploaded = total;
    }
  }

  $: error = errorMessage != null;

  onMount(() => {
    handleFiles({ detail: initialFiles });
  });

  function handleFiles({ detail: newFiles }) {
    for (let i = 0; i < newFiles.length; i++) {
      files.push({
        index: id++,
        file: newFiles[i]
      });
    }
    files = files;
  }

  function removeFile(index) {
    files = files.filter(file => file.index != index);
  }

  function upload() {
    uploadFiles = files.map((file, i) => {
      return {
        file: file.file,
        progress: 0,
        done: false,
        index: i
      };
    });
    emit.setDismissable(false);
    uploadMode = true;

    uploadDocuments(
      files,
      (index, progress) => {
        // Progress handler
        uploadFiles[index].progress = progress;
      },
      async (id, index) => {
        // Complete handler
        uploadFiles[index].done = true;
        await handleNewDocument(id);
      },
      () => {
        // All complete handler
        $layout.uploading = false;
      },
      message => {
        this.errorMessage = message;
        this.$emit("setDismissable", true);
      }
    );
  }
</script>

<style lang="scss">
  .actions {
    margin: 1.5em 0;
  }

  .files {
    display: table;
    width: 100%;
  }

  .padright {
    margin-right: 12px;
  }

  .droparea {
    margin: 24px 0;
  }

  .sectionbreak {
    border-bottom: solid 1px $gray;
    margin: 2em 0 1.5em 0;
  }

  .padder {
    margin: 1.5em 0 2.5em 0;
  }

  .vpadded {
    margin: 2em 0 2.5em 0;
  }

  p.subtitle {
    color: $gray;
  }
</style>

<div>
  <div class="mcontent">
    {#if !uploadMode}
      <div>
        <h1>Document Upload</h1>
        {#if files.length == 0}
          <p>
            Select or drag a .pdf document to begin the document upload process.
            You will then be able to edit document information.
          </p>
        {:else}
          <p>
            {files.length} file{files.length == 1 ? '' : 's'} ready to upload
          </p>
        {/if}
        <div class="actions">
          {#if files.length > 0}
            <span class="padright">
              <Button on:click={upload}>Begin upload</Button>
            </span>
          {:else}
            <FilePicker multiselect={true} on:files={handleFiles}>
              <Button>+ Select files</Button>
            </FilePicker>
          {/if}
        </div>
        {#if files.length == 0}
          <div class="droparea">
            <DropZone on:files={handleFiles}>
              <span>Drag and drop files here</span>
            </DropZone>
          </div>
        {/if}
      </div>
    {/if}
    {#if uploadMode}
      <div>
        {#if !error}
          <h1>Uploading... ({numUploaded}/{files.length})</h1>
          <p>
            Please leave this page open while your documents upload. This dialog
            will automatically close when they have finished uploading.
          </p>
        {:else}
          <h1>Error occurred while uploading</h1>
          <p class="error">
            We failed to {errorMessage}. Please try again later.
          </p>
          <div>
            <Button secondary={true} on:click={emit.allUploaded}>
              Dismiss
            </Button>
          </div>
        {/if}
      </div>
    {/if}
    {#if !uploadMode && files.length > 0}
      <div>
        <p class="subtitle">Edit document information:</p>
      </div>
    {/if}
    {#if files.length > 0}
      <div class="files" class:padder={uploadMode}>
        {#each displayFiles as file (file.index)}
          <File
            class="file"
            file={file.file}
            data={file}
            {uploadMode}
            {error}
            on:name={({ detail: newName }) => {
              file.name = newName;
            }}
            on:delete={() => removeFile(file.index)} />
        {/each}
      </div>
    {/if}
    {#if !uploadMode}
      <div>
        {#if files.length > 0 && !uploadAdditional}
          <div class="vpadded">
            <Button
              nondescript={true}
              on:click={() => (uploadAdditional = true)}>
              Upload additional files
            </Button>
          </div>
        {/if}
        {#if files.length > 0 && uploadAdditional}
          <div>
            <div class="sectionbreak" />
            <FilePicker multiselect={true} on:files={handleFiles}>
              <Button secondary={true} small={true}>+ Select more files</Button>
            </FilePicker>
            <DropZone class="dropper" secondary={true} on:files={handleFiles}>
              <span>Drag and drop additional files here</span>
            </DropZone>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
