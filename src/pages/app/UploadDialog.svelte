<script>
  // Components
  import File from "./File";
  import Button from "@/common/Button";
  import DropZone from "@/common/DropZone";
  import FilePicker from "@/common/FilePicker";
  import UploadOptions from "@/common/UploadOptions";
  import AccessToggle from "@/common/AccessToggle";

  // API
  import { defaultLanguage } from "@/api/languages";
  import { uploadDocuments } from "@/api/document";
  import { search } from "@/search/search";
  import { projects } from "@/manager/projects";

  // Stores
  import { layout } from "@/manager/layout";
  import { handleNewDocuments } from "@/manager/documents";

  // Utils
  import { handlePlural } from "@/util/string";

  import { onMount } from "svelte";
  import emitter from "@/emit";

  const emit = emitter({
    setDismissable() {},
  });

  export let initialFiles = [];

  $: uploadProject =
    $search.params.oneProjectSearch &&
    $projects.projectsById[$search.params.oneProjectSearch] != null
      ? $projects.projectsById[$search.params.oneProjectSearch]
      : null;

  let files = [];
  let id = 0;
  let uploadMode = false;
  let uploadFiles = [];
  let uploadAdditional = false;
  let errorMessage = null;

  let access = "private";
  let language = defaultLanguage;
  let forceOcr = false;

  const LIMIT = parseInt(process.env.UPLOAD_LIMIT);
  const PDF_SIZE_LIMIT = parseInt(process.env.PDF_SIZE_LIMIT);
  const PDF_SIZE_LIMIT_READABLE = process.env.PDF_SIZE_LIMIT_READABLE;
  const DOCUMENT_SIZE_LIMIT = parseInt(process.env.DOCUMENT_SIZE_LIMIT);
  const DOCUMENT_SIZE_LIMIT_READABLE = process.env.DOCUMENT_SIZE_LIMIT_READABLE;

  let tooManyFiles = false;
  let tooManyBigFiles = [false, false];

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
    let hasTooBigPdf = false;
    let hasTooBigDocument = false;

    for (let i = 0; i < newFiles.length; i++) {
      if (files.length < LIMIT) {
        const newFile = newFiles[i];
        const isPdf = newFile.name.toLowerCase().trim().endsWith(".pdf");
        if (
          (isPdf && newFile.size <= PDF_SIZE_LIMIT) ||
          newFile.size <= DOCUMENT_SIZE_LIMIT
        ) {
          files.push({
            index: id++,
            file: newFile,
          });
        } else {
          if (isPdf) {
            hasTooBigPdf = true;
          } else {
            hasTooBigDocument = true;
          }
        }
        tooManyFiles = false;
      } else {
        tooManyFiles = true;
      }
    }
    tooManyBigFiles = [hasTooBigPdf, hasTooBigDocument];
    files = files;
  }

  function removeFile(index) {
    files = files.filter((file) => file.index != index);
    tooManyBigFiles = false;
    tooManyFiles = false;
  }

  function upload() {
    uploadFiles = files.map((file, i) => {
      return {
        file: file.file,
        progress: 0,
        done: false,
        index: i,
      };
    });
    emit.setDismissable(false);
    uploadMode = true;

    uploadDocuments(
      files,
      access,
      language,
      forceOcr,
      uploadProject == null ? [] : [uploadProject],
      (index, progress) => {
        // Progress handler
        uploadFiles[index].progress = progress;
        if (progress >= 1) {
          uploadFiles[index].done = true;
        }
      },
      async (ids) => {
        // All complete handler
        uploadFiles = uploadFiles.map((file) => ({ ...file, done: true }));
        layout.uploading = false;
        await handleNewDocuments(ids);
      },
      (message) => {
        layout.error = message;
        layout.uploading = false;
        emit.setDismissable(true);
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

  .bottompadded {
    margin-bottom: 25px;
  }

  p {
    &.subtitle {
      color: $gray;
    }

    &.danger {
      color: $caution;
      font-size: 13px;
    }
  }

  details {
    margin: -5px 0 8px 0;

    summary {
      @include buttonLike;

      outline: none;
      color: $primary;
      font-size: 14px;
      font-family: inherit;
    }

    p {
      font-size: 14px;
    }
  }
</style>

<div>
  <div class="mcontent">
    {#if !uploadMode}
      <div>
        <h1>
          Document Upload
          {#if uploadProject != null}to {uploadProject.title}{/if}
        </h1>
        {#if files.length == 0}
          <p>
            Select or drag a document to begin the document upload process. You
            will then be able to edit document information.
          </p>
          {#if tooManyBigFiles[0]}
            <p class="danger">
              You can only upload PDF files under
              {PDF_SIZE_LIMIT_READABLE}.
            </p>
          {/if}
          {#if tooManyBigFiles[1]}
            <p class="danger">
              You can only upload non-PDF document files under
              {DOCUMENT_SIZE_LIMIT_READABLE}.
            </p>
          {/if}
        {:else}
          <p>{handlePlural(files.length, 'file', true)} ready to upload</p>
          {#if tooManyFiles}
            <p class="danger">You can only upload {LIMIT} files at once.</p>
          {/if}
        {/if}
        <div class="actions">
          <details>
            <summary>More options</summary>
            <p>
              <UploadOptions bind:language bind:forceOcr />
            </p>
          </details>
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
        <div class="bottompadded">
          <AccessToggle
            bind:access
            publicMessage="Document will be publicly visible."
            collaboratorMessage="Document will be visible to your organization."
            privateMessage="Document will be visible to you alone."
            collaboratorName="Organization" />
        </div>
      </div>
    {/if}
    {#if uploadMode}
      <div>
        {#if !error}
          <h1>
            {#if numUploaded == files.length}
              Almost done... submitting uploaded files for processing
            {:else}Uploading... ({numUploaded}/{files.length}){/if}
          </h1>
          <p>
            Please leave this page open while your documents upload. This dialog
            will automatically close when they have finished uploading.
          </p>
        {:else}
          <h1>Error occurred while uploading</h1>
          <p class="error">
            We failed to
            {errorMessage}. Please try again later.
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
              let name = newName.trim();
              if (name.length == 0) name = 'Untitled';
              file.name = name;
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
