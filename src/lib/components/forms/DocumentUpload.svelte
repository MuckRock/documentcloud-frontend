<script context="module" lang="ts">
  import { error, type ActionResult } from "@sveltejs/kit";
  /**
   * Collect form data into documents and do three-step upload.
   * Exported here for testing and reuse.
   */
  export async function upload(
    form: FormData,
    csrf_token: string,
    fetch = globalThis.fetch,
  ): Promise<ActionResult> {
    // one per file
    const files = Array.from(form.getAll("uploads")) as File[];
    const titles = form.getAll("title") as string[];
    const filenames = form.getAll("filename") as string[];

    // one per batch
    const access = form.get("access") as Access;

    // value is a JSON string
    const ocr_engine: OCREngine = unwrap(form.get("ocr_engine") as string);
    const force_ocr = Boolean(form.get("force_ocr"));
    const revision_control = Boolean(form.get("revision_control"));
    const projects = unwrap(form.get("projects") as string, []);
    const language = unwrap(form.get("language") as string, DEFAULT_LANGUAGE);

    // put things together
    const docs: DocumentUpload[] = titles.map((title, i) => {
      return {
        title,
        access,
        language,
        projects: projects.map((p: Project) => p.id),
        revision_control,
      };
    });

    let created: Document[];
    try {
      created = await documents.create(docs, csrf_token, fetch);
    } catch (err) {
      return {
        type: "error",
        status: 400,
        error: err,
      };
    }

    // upload
    const uploads = created.map((d, i) => ({
      id: d.id,
      presigned_url: new URL(d.presigned_url),
      file: files[i],
    }));

    // todo: handle retries and errors
    const upload_responses = await documents.upload(uploads, fetch);

    console.log(upload_responses.map((r) => r.status));

    // process
    const process_response = await documents.process(
      created.map((d) => ({
        id: d.id,
        force_ocr,
        ocr_engine: ocr_engine.value,
      })),
      csrf_token,
      fetch,
    );

    // todo: i18n
    if (process_response.ok) {
      return {
        type: "success",
        status: 201,
        data: {
          success: true,
          message: `Uploaded ${created.length} documents`,
        },
      };
    }

    return {
      type: "error",
      status: process_response.status,
      error: await process_response.text(),
    };
  }
</script>

<script lang="ts">
  import type {
    Access,
    Document,
    DocumentUpload,
    OCREngine,
    Project,
  } from "$lib/api/types";

  import { applyAction } from "$app/forms";
  import { filesize } from "filesize";
  import { afterUpdate } from "svelte";
  import { _ } from "svelte-i18n";
  import { File16, File24, Upload16, XCircleFill24 } from "svelte-octicons";

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
  import Select, { unwrap } from "../inputs/Select.svelte";
  import Switch from "../inputs/Switch.svelte";
  import Text from "../inputs/Text.svelte";

  import * as documents from "$lib/api/documents";
  import { DEFAULT_LANGUAGE, DOCUMENT_TYPES } from "@/config/config.js";
  import { isSupported } from "@/lib/utils/validateFiles";

  let files: File[] = [];
  let projects: Project[] = [];

  let loading = false;
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

  $: csrf_token = $page.data.csrf_token;
  $: projects = $page.data.projects.results;

  $: total = files.reduce((t, file) => {
    return t + file.size;
  }, 0);

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
    return name.replace(/_/g, " ");
  }

  // handle uploads client side instead of going through the server
  async function onSubmit(e: SubmitEvent) {
    loading = true;
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    const result = await upload(fd, csrf_token);

    // send data up
    await applyAction(result);

    if (result.type === "success") {
      form.reset();
      files = [];
    }

    loading = false;
  }

  afterUpdate(() => {
    const dt = new DataTransfer();

    files.forEach((file) => {
      dt.items.add(file);
    });

    uploader.files = dt.files;
  });
</script>

<form
  method="post"
  enctype="multipart/form-data"
  action="/app/upload/"
  on:submit|preventDefault={onSubmit}
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
        <Dropzone
          bind:active={fileDropActive}
          onDrop={addFiles}
          disabled={loading}
        >
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
      <Button type="submit" full mode="primary" disabled={loading}
        ><Upload16 />Begin Upload</Button
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
