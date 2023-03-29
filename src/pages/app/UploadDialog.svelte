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
  import { _ } from "svelte-i18n";

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
  let ocrEngine = "tess4";

  const LIMIT = parseInt(process.env.UPLOAD_LIMIT);
  const PDF_SIZE_LIMIT = parseInt(process.env.PDF_SIZE_LIMIT);
  const PDF_SIZE_LIMIT_READABLE = process.env.PDF_SIZE_LIMIT_READABLE;
  const DOCUMENT_SIZE_LIMIT = parseInt(process.env.DOCUMENT_SIZE_LIMIT);
  const DOCUMENT_SIZE_LIMIT_READABLE = process.env.DOCUMENT_SIZE_LIMIT_READABLE;

  let tooManyFiles = false;
  let tooManyBigFiles = [false, false];

  $: displayFiles = uploadMode === false ? files : uploadFiles;

  let numUploaded;
  let createProgress = 0;
  let processProgress = 0;
  let uploadInProgress = false;
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
  $: createProgressPercent = `${Math.floor(createProgress * 100)}%`;
  $: processProgressPercent = `${Math.floor(processProgress * 100)}%`;

  $: error = errorMessage !== null;

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
      ocrEngine,
      uploadProject == null ? [] : [uploadProject],
      (progress) => {
        // Create progress handler
        createProgress = progress;
      },
      (index, progress) => {
        // Progress handler
        uploadInProgress = true;
        uploadFiles[index].progress = progress;
        if (progress >= 1) {
          uploadFiles[index].done = true;
        }
      },
      (progress) => {
        // Process progress handler
        processProgress = progress;
      },
      async (goodDocuments) => {
        // All complete handler
        uploadFiles = uploadFiles.map((file) => ({ ...file, done: true }));
        layout.uploading = false;
        await handleNewDocuments(goodDocuments);
      },
      (message) => {
        layout.error = message;
        layout.uploading = false;
        emit.setDismissable(true);
      },
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
</style>

<div>
  <div class="mcontent">
    {#if !uploadMode}
      <div>
        <h2>
          {#if uploadProject == null}
            {$_("uploadDialog.docUpload")}
          {:else}
            {$_("uploadDialog.docUploadProj", {
              values: { title: uploadProject.title },
            })}
          {/if}
        </h2>
        {#if files.length == 0}
          <p>
            {$_("uploadDialog.selectDocument")}
          </p>
          {#if tooManyBigFiles[0]}
            <p class="danger">
              {$_("uploadDialog.pdfSizeWarning", {
                values: { size: PDF_SIZE_LIMIT_READABLE },
              })}
            </p>
          {/if}
          {#if tooManyBigFiles[1]}
            <p class="danger">
              {$_("uploadDialog.pdfSizeWarning", {
                values: { size: DOCUMENT_SIZE_LIMIT_READABLE },
              })}
            </p>
          {/if}
        {:else}
          <p>{$_("uploadDialog.fileReady", { values: { n: files.length } })}</p>
          {#if tooManyFiles}
            <p class="danger">
              {$_("uploadDialog.fileLimitWarning", {
                values: { limit: LIMIT },
              })}
            </p>
          {/if}
        {/if}
        <div class="actions">
          <h3>{$_("uploadDialog.moreOptions")}</h3>

          <UploadOptions bind:language bind:forceOcr bind:ocrEngine />

          {#if files.length > 0}
            <Button on:click={upload}>{$_("uploadDialog.beginUpload")}</Button>
          {:else}
            <FilePicker multiselect={true} on:files={handleFiles}>
              <Button>{$_("uploadDialog.selectFiles")}</Button>
            </FilePicker>
          {/if}
        </div>
        {#if files.length == 0}
          <div class="droparea">
            <DropZone on:files={handleFiles}>
              <span>{$_("uploadDialog.dragDrop")}</span>
            </DropZone>
          </div>
        {/if}
        <div class="bottompadded">
          <AccessToggle
            bind:access
            publicMessage={$_("uploadDialog.publicMsg")}
            collaboratorMessage={$_("uploadDialog.collabMsg")}
            privateMessage={$_("uploadDialog.privateMsg")}
            collaboratorName={$_("uploadDialog.collabName")}
          />
        </div>
      </div>
    {/if}
    {#if uploadMode}
      <div>
        {#if !error}
          <h2>
            {#if numUploaded == files.length}
              {$_("uploadDialog.submitting", {
                values: { percent: processProgressPercent },
              })}
            {:else if uploadInProgress}
              {$_("uploadDialog.uploading", {
                values: { uploaded: numUploaded, length: files.length },
              })}
            {:else}
              {$_("uploadDialog.gettingInfo", {
                values: { percent: createProgressPercent },
              })}
            {/if}
          </h2>
          <p>
            {$_("uploadDialog.pleaseLeaveOpen")}
          </p>
        {:else}
          <h2>{$_("uploadDialog.errorHeading")}</h2>
          <p class="error">
            {$_("uploadDialog.errorMsg", {
              values: { errorMessage: errorMessage },
            })}
          </p>
          <div>
            <Button secondary={true} on:click={emit.allUploaded}>
              {$_("dialog.dismiss")}
            </Button>
          </div>
        {/if}
      </div>
    {/if}
    {#if !uploadMode && files.length > 0}
      <div>
        <p class="subtitle">{$_("uploadDialog.editDocInfo")}</p>
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
              if (name.length == 0) name = $_("uploadDialog.untitled");
              file.name = name;
            }}
            on:delete={() => removeFile(file.index)}
          />
        {/each}
      </div>
    {/if}
    {#if !uploadMode}
      <div>
        {#if files.length > 0 && !uploadAdditional}
          <div class="vpadded">
            <Button
              nondescript={true}
              on:click={() => (uploadAdditional = true)}
              >{$_("uploadDialog.uploadFiles")}</Button
            >
          </div>
        {/if}
        {#if files.length > 0 && uploadAdditional}
          <div>
            <div class="sectionbreak" />
            <FilePicker multiselect={true} on:files={handleFiles}>
              <Button secondary={true} small={true}>
                {$_("uploadDialog.selectMore")}
              </Button>
            </FilePicker>
            <DropZone class="dropper" secondary={true} on:files={handleFiles}>
              <span>{$_("uploadDialog.dragDropMore")}</span>
            </DropZone>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
