<script context="module" lang="ts">
  import type { ActionResult } from "@sveltejs/kit";

  import { get, writable } from "svelte/store";

  import { DEFAULT_LANGUAGE, LANGUAGE_MAP } from "@/config/config.js";
  import { load } from "$lib/components/processing/ProcessContext.svelte";
  import { userDocs } from "$lib/utils/search";

  export const filesToUpload = writable<File[]>([]);
  function getFilesToUpload() {
    // Empty the store when returning the files
    const files = get(filesToUpload);
    filesToUpload.set([]);
    return files;
  }

  export const uploadToProject = writable<Project>(null);
  function getProjectToUpload() {
    const project = get(uploadToProject);
    uploadToProject.set(null);
    return project;
  }

  /* export async function _upload(
    form: FormData,
    csrf_token: string,
    user: User,
    fetch = globalThis.fetch,
  ): Promise<ActionResult> {
    // one per file
    const files = Array.from(form.getAll("uploads")) as File[];
    const titles = form.getAll("title") as string[];
    const filenames = form.getAll("filename") as string[];

    // one per batch
    const access = (form.get("access") || "private") as Access;

    // value is a JSON string
    const ocr_engine: OCREngine = unwrap(form.get("ocr_engine") as string);
    const force_ocr = Boolean(form.get("force_ocr"));
    const revision_control = Boolean(form.get("revision_control"));
    const projects = unwrap(form.get("projects") as string, []);
    const language = unwrap(form.get("language") as string, DEFAULT_LANGUAGE);

    // put things together
    const docs: DocumentUpload[] = titles.map((title, i) => {
      const ext = getFileExtension(files[i]);
      return {
        title,
        access,
        language,
        projects,
        revision_control,
        original_extension: ext,
      };
    });

    let { data: created, error } = await documents.create(
      // @ts-ignore
      docs,
      csrf_token,
      fetch,
    );

    // upload
    // @ts-ignore
    const uploads = created.map((d, i) =>
      documents.upload(new URL(d.presigned_url), files[i], fetch),
    );

    // todo: handle retries and errors
    const upload_responses = await Promise.all(uploads);

    // console.log(upload_responses.map((r) => r.status));

    // process
    const process_response = await documents.process(
      // @ts-ignore
      created.map((d) => ({
        id: d.id,
        force_ocr,
        ocr_engine: ocr_engine.value,
      })),
      csrf_token,
      fetch,
    );

    // todo: i18n
    if (!process_response.error) {
      load();
      const query = new URLSearchParams([["q", userDocs(user, access)]]);
      return {
        type: "redirect",
        status: 302,
        location: "/documents/?" + query.toString(),
      };
    }

    return {
      type: "error",
      status: process_response.error.status,
      error: process_response.error.errors,
    };
  } */
</script>

<script lang="ts">
  import type {
    Access,
    APIError,
    Document,
    DocumentUpload,
    OCREngine,
    Project,
  } from "$lib/api/types";

  import { applyAction } from "$app/forms";
  import { goto } from "$app/navigation";

  import { filesize } from "filesize";
  import { afterUpdate } from "svelte";
  import { _ } from "svelte-i18n";
  import {
    Alert16,
    Paperclip16,
    Paperclip24,
    Upload16,
    XCircleFill24,
  } from "svelte-octicons";

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
  import Tooltip from "$lib/components/common/Tooltip.svelte";

  import { DOCUMENT_TYPES } from "@/config/config.js";
  import * as documents from "$lib/api/documents";
  import {
    filenameToTitle,
    getFileExtension,
    isSupported,
    isWithinSizeLimit,
  } from "$lib/utils/files";
  import { getCurrentUser } from "$lib/utils/permissions";

  type UploadStatus = {
    file?: File;
    document?: Document;
    error?: APIError<unknown>;
    step?: "ready" | "created" | "uploading" | "processing";
  };

  export let csrf_token = "";
  export let files: File[] = getFilesToUpload();
  export let projects: Project[] = [];

  const me = getCurrentUser();

  // upload status
  let loading = false;
  let fileDropActive: boolean;

  let status: Record<string, UploadStatus> = {};

  let uploader: HTMLInputElement;

  // fields
  let access: Access = "private";
  let language: { value: string; label: string } = {
    value: DEFAULT_LANGUAGE,
    label: LANGUAGE_MAP.get(DEFAULT_LANGUAGE),
  };

  const ocrEngineOptions = [
    {
      value: "tess4",
      label: "Tesseract",
      help: $_("uploadDialog.tesseract"),
    },
    {
      value: "textract",
      label: "Textract",
      help: $_("uploadDialog.textract"),
    },
  ];

  let ocrEngine = ocrEngineOptions[0];
  let add_to_projects: Project[] = [];

  $: total = files.reduce((t, file) => {
    return t + file.size;
  }, 0);

  $: exceedsSizeLimit = files.some((file) => !isWithinSizeLimit(file));

  $: console.log(status);

  /* afterUpdate(() => {
    const dt = new DataTransfer();

    files.forEach((file) => {
      dt.items.add(file);
    });

    uploader.files = dt.files;
  }); */

  function addFiles(filesToAdd: FileList) {
    files = files.concat(Array.from(filesToAdd).filter(isSupported));
  }

  function removeFile(index: number) {
    files = files.filter((f, i) => i !== index);
  }

  function onPaste(e: ClipboardEvent) {
    const { clipboardData } = e;
    if (!clipboardData) return;
    addFiles(clipboardData.files);
  }

  // handle uploads client side instead of going through the server
  /* async function _onSubmit(e: SubmitEvent) {
    loading = true;
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    // const result = await _upload(fd, csrf_token, $me);

    // send data up
    await applyAction(result);

    if (result.type === "success") {
      form.reset();
      files = [];
    }

    if (result.type === "redirect") {
      goto(result.location, { invalidateAll: true });
    }

    loading = false;
  } */

  // handle submit and send each file to upload
  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    loading = true;

    const form = new FormData(e.target as HTMLFormElement);

    const access = form.get("access") as Access;
    const titles = form.getAll("title") as string[];
    const revision_control = form.get("revision_control") === "on";

    const promises = files.map((file, i) =>
      upload(
        file,
        {
          title: titles[i],
          original_extension: getFileExtension(file),
          access,
          projects: add_to_projects.map((p) => p.id),
          language: language.value,
          revision_control,
        },
        form,
      ),
    );

    // errors are handled within each promise, so we can just wait for all to be settled
    await Promise.allSettled(promises);

    loading = false;
  }

  // upload one file
  async function upload(file: File, metadata: DocumentUpload, form: FormData) {
    status[file.name] = {
      file,
    };

    // create
    let { data: document, error } = await documents.create(
      metadata,
      csrf_token,
    );

    status[file.name] = {
      file,
      document,
      error,
      step: "created",
    };

    // bail here on error, console.error to report this to sentry
    if (error) {
      return console.error(error);
    }

    // upload
    let presigned_url: URL;
    try {
      presigned_url = new URL(document.presigned_url);
    } catch (e) {
      error = {
        status: 500,
        message: "Invalid presigned URL",
        errors: e,
      };
    }

    if (error) {
      status[file.name].error = error;
      return console.error(error);
    }

    status[file.name].step = "uploading";
    const resp = await documents
      .upload(new URL(document.presigned_url), file)
      .catch(console.error);

    if (!resp) {
      status[file.name].error = {
        status: 500,
        message: "Upload failed",
      };
      return;
    }

    // process, if we've made it this far with no errors
    status[file.name].step = "processing";
    const force_ocr = form.get("force_ocr") === "on";

    ({ error } = await documents.process(
      [{ id: document.id, force_ocr, ocr_engine: ocrEngine.value }],
      csrf_token,
    ));

    if (error) {
      status[file.name].error = error;
    }
  }
</script>

<svelte:window on:paste={onPaste} />

<Dropzone bind:active={fileDropActive} onDrop={addFiles} disabled={loading}>
  <form
    method="post"
    enctype="multipart/form-data"
    action="/upload/"
    on:submit={onSubmit}
  >
    <Flex gap={1} align="stretch" wrap>
      <div class="files" class:active={fileDropActive}>
        <!-- Add any header and messaging using this slot -->
        <slot />

        <div class="fileList" class:empty={files.length === 0}>
          {#each files as file, index}
            <Flex align="center" gap={1} role="listitem">
              <div class="title">
                <Text
                  name="title"
                  value={filenameToTitle(file.name)}
                  disabled={!!status[file.name]}
                  required
                />
                <input type="hidden" name="filename" value={file.name} />
              </div>
              <p class="fileInfo" class:error={!isWithinSizeLimit(file)}>
                <span class="uppercase">
                  {getFileExtension(file)} / {filesize(file.size)}
                </span>
                {#if !isWithinSizeLimit(file)}
                  <Tooltip
                    caption="The maximum size for a {getFileExtension(
                      file,
                    ).toUpperCase()} is {getFileExtension(file) === 'pdf'
                      ? '500MB'
                      : '25MB'}"
                  >
                    <Alert16 fill="var(--red-3)" />
                  </Tooltip>
                {/if}
              </p>
              <button
                class="fileRemove"
                on:click|preventDefault={() => removeFile(index)}
              >
                <XCircleFill24 />
              </button>
            </Flex>
          {:else}
            <Empty icon={Paperclip24}>
              {$_("uploadDialog.empty")}
            </Empty>
          {/each}
        </div>
        <div class="fileUpload" class:disabled={loading}>
          <Flex align="center">
            <FileInput multiple onFileSelect={addFiles} disabled={loading}>
              <Paperclip16 />
              {$_("uploadDialog.selectFiles")}
            </FileInput>
            {#if files.length > 0}
              <div class="total">
                <p>
                  {$_("uploadDialog.totalFiles", {
                    values: { n: files.length },
                  })},
                  <span class="uppercase">{filesize(total)}</span>
                </p>
              </div>
            {/if}
          </Flex>
          <p class="drop-instructions">{$_("uploadDialog.dragDrop")}</p>
        </div>
      </div>

      <div class="sidebar">
        <Flex gap={1} direction="column">
          <Button
            type="submit"
            full
            mode="primary"
            disabled={loading || exceedsSizeLimit || !csrf_token}
          >
            <Upload16 />{$_("uploadDialog.beginUpload")}
          </Button>

          <Field>
            <FieldLabel>{$_("uploadDialog.accessLevel")}</FieldLabel>
            <AccessLevel name="access" bind:selected={access} />
          </Field>
          <Field>
            <FieldLabel>{$_("uploadDialog.projects")}</FieldLabel>
            <Select
              name="projects"
              multiple
              items={projects}
              itemId="id"
              label="title"
              bind:value={add_to_projects}
            />
          </Field>
          <hr class="divider" />
          <Field>
            <FieldLabel>{$_("uploadDialog.language")}</FieldLabel>
            <Language name="language" bind:value={language} />
          </Field>
          <Field>
            <FieldLabel>{$_("uploadDialog.ocrEngine")}</FieldLabel>
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
            <FieldLabel>{$_("uploadDialog.forceOcr")}</FieldLabel>
          </Field>
          <hr class="divider" />

          <Premium>
            <Field inline>
              <Switch name="revision_control" />
              <FieldLabel premium>
                {$_("uploadDialog.revisionControl")}
              </FieldLabel>
              <p slot="help">
                {$_("uploadDialog.revisionControlHelp")}
              </p>
            </Field>
            <Field inline slot="basic">
              <Switch name="revision_control" disabled />
              <FieldLabel premium>Revision Control</FieldLabel>
              <p slot="help">
                {$_("uploadDialog.revisionControlHelp")}
              </p>
            </Field>
          </Premium>
        </Flex>

        <!-- <input
          type="file"
          name="uploads"
          multiple
          bind:this={uploader}
          accept={DOCUMENT_TYPES.join(",")}
        /> -->
      </div>
    </Flex>
  </form>
</Dropzone>

<style>
  .files {
    flex: 2 0 20rem;

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    align-self: stretch;

    border: 1px solid var(--gray-2, #d8dee2);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .fileList {
    display: flex;
    padding: 1.5rem;
    flex-direction: column;
    gap: 0.75rem;
    align-self: stretch;
    flex: 1 0 0;
  }

  .total {
    color: var(--gray-4);
    font-size: var(--font-sm);
    font-weight: var(--font-semibold);
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
  }

  .fileList.empty {
    justify-content: center;
    align-items: center;
  }

  .fileUpload {
    flex: 0 0 0;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    padding: 1rem 1.5rem;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    align-self: stretch;

    background: var(--gray-1, #f5f6f7);
  }

  .fileInfo {
    flex: 0 1 0;
    font-size: var(--font-xs);
    color: var(--gray-5);
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .fileInfo.error {
    color: var(--red-3);
  }

  .title {
    flex: 1 0 auto;
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
    font-size: var(--font-sm);
    font-style: normal;
    line-height: 1.25rem; /* 125% */

    opacity: 0.75;
  }

  .active {
    background: var(--blue-2);
    border-color: var(--blue-3);
  }

  .active .fileUpload {
    background: var(--blue-1);
  }

  .active .drop-instructions {
    color: var(--blue-5);
  }

  .sidebar {
    flex: 1 1 8rem;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 2rem;
  }

  .uppercase {
    text-transform: uppercase;
  }

  /*
  input[name="uploads"] {
    display: none;
  } */
</style>
