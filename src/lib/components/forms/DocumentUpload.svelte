<script lang="ts">
  import type { Project } from "$lib/api/types";

  import { filesize } from "filesize";
  import { _ } from "svelte-i18n";
  import { File16, File24, Upload16, XCircleFill24 } from "svelte-octicons";

  import { enhance } from "$app/forms";
  import { page } from "$app/stores";

  import Button from "../common/Button.svelte";
  import Empty from "../common/Empty.svelte";
  import Field from "../common/Field.svelte";
  import FieldLabel from "../common/FieldLabel.svelte";
  import Flex from "../common/Flex.svelte";
  import Premium from "../common/Premium.svelte";

  import AccessLevel from "../inputs/AccessLevel.svelte";
  import Dropzone from "../inputs/Dropzone.svelte";
  import FileInput from "../inputs/File.svelte";
  import Language from "../inputs/Language.svelte";
  import Select from "../inputs/Select.svelte";
  import Switch from "../inputs/Switch.svelte";
  import Text from "../inputs/Text.svelte";

  import { DOCUMENT_TYPES } from "@/config/config.js";
  import { isSupported } from "@/lib/utils/validateFiles";
  import { afterUpdate } from "svelte";

  let files: File[] = [];
  let projects: Project[] = [];

  let uploader: HTMLInputElement;

  let fileDropActive: boolean;

  const ocrEngineOptions = [
    {
      value: "tess4",
      label: "Tesseract",
      help: $_("uploadOptions.tesseract"),
    },
    {
      value: "textract",
      label: "Textract",
      help: $_("uploadOptions.textract"),
    },
  ];

  let ocrEngine = ocrEngineOptions[0];

  $: projects = $page.data.projects.results;

  function addFiles(filesToAdd: FileList) {
    files = files.concat(Array.from(filesToAdd).filter(isSupported));
  }

  function removeFile(index: number) {
    files = files.filter((f, i) => i !== index);
  }

  function formatFileType(filetype: string) {
    if (filetype && filetype.includes("/")) {
      return filetype.split("/")[1];
    }
    return "unknown";
  }

  function filenameToTitle(filename: string): string {
    const [name, ...ext] = filename.split(".");
    return name.replace(/_/g, " ").replace(/([A-Z])/g, " $1");
  }

  $: total = files.reduce((t, file) => {
    return t + file.size;
  }, 0);

  afterUpdate(() => {
    const dt = new DataTransfer();

    files.forEach((file) => {
      dt.items.add(file);
    });

    uploader.files = dt.files;
  });
</script>

<form
  use:enhance
  method="post"
  enctype="multipart/form-data"
  action="/app/upload/"
>
  <Flex gap={1} align="stretch" wrap>
    <div class="files">
      <!-- add any header and messaging using this slot -->
      <slot />

      <div class="fileList" class:empty={files.length === 0}>
        {#each files as file, index}
          <Flex align="center" gap={1}>
            <p class="fileInfo">
              {formatFileType(file.type)} / {filesize(file.size)}
            </p>
            <div class="title">
              <Text name="title" value={filenameToTitle(file.name)} required />
              <input type="hidden" name="filename" value={file.name} />
            </div>
            <button
              class="fileRemove"
              on:click|preventDefault={() => removeFile(index)}
            >
              <XCircleFill24 />
            </button>
          </Flex>
        {:else}
          <Empty icon={File24}>
            Get started by selecting, pasting or dragging-and-dropping files
            below
          </Empty>
        {/each}

        <div class="total">
          <p>Total upload size: {filesize(total)}</p>
        </div>
      </div>
      <div class="fileUpload">
        <Dropzone bind:active={fileDropActive} onDrop={addFiles}>
          <div class="fileDrop" class:active={fileDropActive}>
            <p class="drop-instructions">Drag and drop files here</p>
            <Flex align="center" justify="center">
              <span class="drop-instructions-or">or</span>
              <FileInput multiple onFileSelect={addFiles}
                ><File16 /> Select Files</FileInput
              >
            </Flex>
          </div>
        </Dropzone>
      </div>
    </div>
    <div class="sidebar">
      <Flex gap={1} direction="column">
        <Field>
          <FieldLabel>Access Level</FieldLabel>
          <AccessLevel name="access" />
        </Field>
        <Field>
          <FieldLabel>Projects</FieldLabel>
          <Select
            name="projects"
            multiple
            items={projects}
            itemId="id"
            label="title"
          />
        </Field>
        <hr class="divider" />
        <Field>
          <FieldLabel>Language</FieldLabel>
          <Language />
        </Field>
        <Field>
          <FieldLabel>OCR Engine</FieldLabel>
          <Select
            name="ocr_engine"
            items={ocrEngineOptions}
            bind:value={ocrEngine}
          />
          <p slot="help">
            {@html ocrEngine.help}
          </p>
        </Field>
        <Field inline>
          <input type="checkbox" name="force_ocr" />
          <FieldLabel>Force OCR</FieldLabel>
        </Field>
        <hr class="divider" />

        <Premium>
          <Field inline>
            <Switch name="revision_control" />
            <FieldLabel premium>Revision Control</FieldLabel>
            <p slot="help">
              All previous versions to the document will be preserved and
              available for download.
            </p>
          </Field>
          <Field inline slot="basic">
            <Switch name="revision_control" disabled />
            <FieldLabel premium>Revision Control</FieldLabel>
            <p slot="help">
              All previous versions to the document will be preserved and
              available for download.
            </p>
          </Field>
        </Premium>
      </Flex>
      <Button type="submit" full mode="primary"><Upload16 />Begin Upload</Button
      >

      <input
        type="file"
        name="uploads"
        multiple
        bind:this={uploader}
        accept={DOCUMENT_TYPES.join(",")}
      />
    </div>
  </Flex>
</form>

<style>
  .files {
    flex: 2 0 20rem;

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    align-self: stretch;
  }

  .fileList {
    display: flex;
    padding: 1.5rem;
    flex-direction: column;
    gap: 0.75rem;
    align-self: stretch;
    flex: 1 0 0;
    border-radius: 0.5rem;
    border: 1px solid var(--gray-2, #d8dee2);
  }

  .fileList.empty {
    justify-content: center;
    align-items: center;
  }

  .fileUpload {
    flex: 0 0 0;
    width: 100%;
  }

  .fileDrop {
    display: flex;
    padding: 1rem 1.5rem;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    align-self: stretch;

    border-radius: 0.5rem;
    border: 1px solid var(--gray-2, #d8dee2);
    background: var(--gray-1, #f5f6f7);
  }

  .fileInfo {
    flex: 1 0 0;
    font-size: var(--font-xs);
    color: var(--gray-5);
    white-space: nowrap;
    text-transform: uppercase;
  }

  .title {
    flex: 1 1 auto;
  }

  .fileRemove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    appearance: none;
    background: transparent;
    border: none;
    border-radius: 0.5rem;
    fill: var(--gray-3);
    cursor: pointer;
  }

  .fileRemove:hover,
  .fileRemove:focus {
    background: var(--blue-1);
  }

  .drop-instructions {
    color: var(--gray-5, #233944);
    text-align: center;
    font-family: "Source Sans Pro";
    font-size: 1rem;
    font-style: normal;
    font-weight: 600;
    line-height: 1.25rem; /* 125% */

    opacity: 0.75;
  }

  .drop-instructions-or {
    color: var(--gray-4);
  }

  .fileDrop.active {
    background: var(--blue-2);
    border-color: var(--blue-3);
  }

  .fileDrop.active .drop-instructions {
    color: var(--blue-5);
  }

  .sidebar {
    flex: 1 1 8rem;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 2rem;
  }

  .divider {
    width: 100%;
    border: none;
    border-top: 1px solid var(--gray-2, #d8dee2);
  }

  input[name="uploads"] {
    display: none;
  }
</style>
