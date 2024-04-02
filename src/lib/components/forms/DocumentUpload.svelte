<script lang="ts">
  import type { access } from "$lib/api/types";
  import { filesize } from "filesize";
  import { _ } from "svelte-i18n";
  import { File16, File24, Upload16, XCircleFill24 } from "svelte-octicons";

  import AccessLevel from "./AccessLevel.svelte";
  import Button from "../common/Button.svelte";
  import Dropzone from "./Dropzone.svelte";
  import Empty from "../common/Empty.svelte";
  import Field from "./Field.svelte";
  import FieldLabel from "./FieldLabel.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import InputFile from "./InputFile.svelte";
  import InputSelect from "./InputSelect.svelte";
  import InputText from "./InputText.svelte";
  import Premium from "../common/Premium.svelte";
  import Switch from "$lib/components/common/Switch.svelte";

  import { removeUnsupportedTypes } from "@/lib/utils/validateFiles";

  interface UploadFile {
    index: number;
    name: string;
    type: string;
    size: number;
    file: File;
  }

  export let files: UploadFile[] = [];

  let form: HTMLFormElement;

  let fileDropActive: boolean;

  let accessLevel: access;

  const projectOptions = [
    { value: "1", label: "FBI Files" },
    { value: "2", label: "1033 Program" },
  ];

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

  export function values() {
    return Object.fromEntries(new FormData(form));
  }

  function createUploadFile(file: File, index: number): UploadFile {
    return {
      index,
      name: file.name,
      type: file.type,
      size: file.size,
      file,
    };
  }

  function addFiles(filesToAdd: FileList) {
    const supportedFiles = removeUnsupportedTypes([...filesToAdd]);
    files = files.concat(supportedFiles.map(createUploadFile));
  }

  function removeFile(fileToRemove: UploadFile) {
    files = files.filter((file) => file.index !== fileToRemove.index);
  }

  function formatFileType(filetype: string) {
    if (filetype && filetype.includes("/")) {
      return filetype.split("/")[1];
    }
    return "unknown";
  }
</script>

<form bind:this={form} method="post" enctype="multipart/form-data">
  <Flex gap={1} align="stretch" wrap>
    <div class="files">
      <div class="fileList" class:empty={files.length === 0}>
        {#each files as file}
          <Flex align="center" gap={1}>
            <p class="fileInfo">
              {formatFileType(file.type)} / {filesize(file.size)}
            </p>
            <div class="title">
              <InputText bind:value={file.name} />
            </div>
            <button
              class="fileRemove"
              on:click|preventDefault={() => removeFile(file)}
            >
              <XCircleFill24 />
            </button>
          </Flex>
        {:else}
          <Empty icon={File24}>
            Get started by selecting, pasting, or dragging-and-dropping files
            below
          </Empty>
        {/each}
      </div>
      <div class="fileUpload">
        <Dropzone bind:active={fileDropActive} onDrop={addFiles}>
          <div class="fileDrop" class:active={fileDropActive}>
            <p class="drop-instructions">Drag and drop files here</p>
            <Flex align="center" justify="center">
              <span class="drop-instructions-or">or</span>
              <InputFile name="files" multiple onFileSelect={addFiles}
                ><File16 /> Select Files</InputFile
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
          <AccessLevel name="access" bind:selected={accessLevel} />
        </Field>
        <Field>
          <FieldLabel>Projects</FieldLabel>
          <InputSelect name="projects" multiple items={projectOptions} />
        </Field>
        <hr class="divider" />
        <Field>
          <FieldLabel>OCR Engine</FieldLabel>
          <InputSelect
            name="_ocr_engine_json"
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
</style>
