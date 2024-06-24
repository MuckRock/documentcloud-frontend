<script context="module" lang="ts">
  import type { ActionResult } from "@sveltejs/kit";
  import { DEFAULT_LANGUAGE } from "@/config/config.js";
  import { userDocs } from "$lib/utils/search";

  /**
   * Collect form data into documents and do three-step upload.
   * Exported here for testing and reuse.
   */
  export async function upload(
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
        projects: projects.map((p: Project) => p.id),
        revision_control,
        original_extension: ext,
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
    const uploads = created.map((d, i) =>
      documents.upload(new URL(d.presigned_url), files[i], fetch),
    );

    // todo: handle retries and errors
    const upload_responses = await Promise.all(uploads);

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
      const query = new URLSearchParams([["q", userDocs(user, access)]]);
      return {
        type: "redirect",
        status: 302,
        location: "/app/?" + query.toString(),
      };
    }

    return {
      type: "error",
      status: process_response.status,
      error: await process_response.json(),
    };
  }
</script>

<script lang="ts">
  import type { Writable } from "svelte/store";
  import type {
    Access,
    Document,
    DocumentUpload,
    OCREngine,
    Project,
  } from "$lib/api/types";
  import type { User } from "@/api/types/orgAndUser";

  import { applyAction } from "$app/forms";
  import { goto } from "$app/navigation";
  import { filesize } from "filesize";
  import { afterUpdate, getContext } from "svelte";
  import { _ } from "svelte-i18n";
  import {
    Alert16,
    File16,
    File24,
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

  import * as documents from "$lib/api/documents";
  import { DOCUMENT_TYPES } from "@/config/config.js";
  import {
    filenameToTitle,
    getFileExtension,
    isSupported,
    isWithinSizeLimit,
  } from "@/lib/utils/files";
  import Tooltip from "@/common/Tooltip.svelte";

  export let csrf_token = "";
  export let files: File[] = [];
  export let projects: Project[] = [];

  const me: Writable<User> = getContext("me");

  let loading = false;
  let uploader: HTMLInputElement;

  let fileDropActive: boolean;

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

  $: total = files.reduce((t, file) => {
    return t + file.size;
  }, 0);

  $: exceedsSizeLimit = files.some((file) => !isWithinSizeLimit(file));

  function addFiles(filesToAdd: FileList) {
    files = files.concat(Array.from(filesToAdd).filter(isSupported));
  }

  function removeFile(index: number) {
    files = files.filter((f, i) => i !== index);
  }

  // handle uploads client side instead of going through the server
  async function onSubmit(e: SubmitEvent) {
    loading = true;
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    const result = await upload(fd, csrf_token, $me);

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
      <!-- Add any header and messaging using this slot -->
      <slot />

      <div class="fileList" class:empty={files.length === 0}>
        {#each files as file, index}
          <Flex align="center" gap={1} role="listitem">
            <p class="fileInfo" class:error={!isWithinSizeLimit(file)}>
              <span class="uppercase"
                >{getFileExtension(file)} / {filesize(file.size)}</span
              >
              {#if !isWithinSizeLimit(file)}
                <Tooltip
                  caption="The maximum size for a {getFileExtension(
                    file,
                  ).toUpperCase()} is {getFileExtension(file) === 'pdf'
                    ? '500MB'
                    : '25MB'}"
                >
                  <Alert16 fill="var(--red)" />
                </Tooltip>
              {/if}
            </p>
            <div class="title">
              <Text
                name="title"
                value={filenameToTitle(file.name)}
                required
                disabled={loading}
              />
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
            {$_("uploadDialog.empty")}
          </Empty>
        {/each}
        {#if files.length > 0}
          <div class="total">
            <p>
              {$_("uploadDialog.totalFiles", { values: { n: files.length } })},
              <span class="uppercase">{filesize(total)}</span>
            </p>
          </div>
        {/if}
      </div>
      <div class="fileUpload">
        <Dropzone
          bind:active={fileDropActive}
          onDrop={addFiles}
          disabled={loading}
        >
          <div
            class="fileDrop"
            class:active={fileDropActive}
            class:disabled={loading}
          >
            <p class="drop-instructions">{$_("uploadDialog.dragDrop")}</p>
            <Flex align="center" justify="center">
              <span class="drop-instructions-or">{$_("common.or")}</span>
              <FileInput multiple onFileSelect={addFiles} disabled={loading}
                ><File16 />{$_("uploadDialog.selectFiles")}</FileInput
              >
            </Flex>
          </div>
        </Dropzone>
      </div>
    </div>
    <div class="sidebar">
      <Flex gap={1} direction="column">
        <Field>
          <FieldLabel>{$_("uploadDialog.accessLevel")}</FieldLabel>
          <AccessLevel name="access" />
        </Field>
        <Field>
          <FieldLabel>{$_("uploadDialog.projects")}</FieldLabel>
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
          <FieldLabel>{$_("uploadDialog.language")}</FieldLabel>
          <Language />
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
            <FieldLabel premium>{$_("uploadDialog.revisionControl")}</FieldLabel
            >
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
      <Button
        type="submit"
        full
        mode="primary"
        disabled={loading || exceedsSizeLimit}
        ><Upload16 />{$_("uploadDialog.beginUpload")}</Button
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
    position: relative;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .fileList .total {
    position: absolute;
    bottom: -0.85rem;
    left: 0.5rem;
    background: var(--white);
    border: 1px solid var(--gray-2);
    font-size: var(--font-s);
    font-weight: var(--font-semibold);
    box-shadow: var(--shadow);
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
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-top: none;
  }

  .fileInfo {
    flex: 1 0 0;
    font-size: var(--font-xs);
    color: var(--gray-5);
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .fileInfo.error {
    color: var(--red);
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

  .uppercase {
    text-transform: uppercase;
  }

  input[name="uploads"] {
    display: none;
  }
</style>
