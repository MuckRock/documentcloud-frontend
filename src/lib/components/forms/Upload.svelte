<!-- @component
Upload documents to DocumentCloud.

This component works entirely in the client, hitting the API directly 
and sending files to S3 without passing through our servers.

The component exposes a property called `files`, allowing us to provide
an initial set of files for upload. This isn't used directly, though.
All file handling happens through an internal status object that tracks
progress through the three-part upload process.
-->
<script context="module" lang="ts">
  import { get, writable } from "svelte/store";

  import { DEFAULT_LANGUAGE, LANGUAGE_MAP } from "@/config/config.js";

  export const filesToUpload = writable<File[]>([]);
  function getFilesToUpload() {
    // Empty the store when returning the files
    const files = get(filesToUpload);
    filesToUpload.set([]);
    return files;
  }

  export const uploadToProject = writable<Nullable<Project>>(null);
  function getProjectToUpload() {
    const project = get(uploadToProject);
    uploadToProject.set(null);
    return project;
  }
</script>

<script lang="ts">
  import type {
    Access,
    DocumentUpload,
    Maybe,
    Nullable,
    Project,
  } from "$lib/api/types";

  import { beforeNavigate } from "$app/navigation";

  import { filesize } from "filesize";
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import { Paperclip16, Paperclip24, Upload16 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Empty from "../common/Empty.svelte";
  import Field from "../common/Field.svelte";
  import FieldLabel from "../common/FieldLabel.svelte";
  import Flex from "../common/Flex.svelte";
  import Premium from "../common/Premium.svelte";
  import Unverified from "../accounts/Unverified.svelte";

  import AccessLevel from "../inputs/AccessLevel.svelte";
  import Dropzone from "../inputs/Dropzone.svelte";
  import FileInput from "../inputs/File.svelte";
  import Language from "../inputs/Language.svelte";
  import Select from "../inputs/Select.svelte";
  import Switch from "../inputs/Switch.svelte";

  import UploadListItem, { type UploadStatus } from "./UploadListItem.svelte";

  import * as documents from "$lib/api/documents";
  import {
    getFileExtension,
    isSupported,
    isWithinSizeLimit,
  } from "$lib/utils/files";
  import { getCsrfToken } from "$lib/utils/api";
  import { getCurrentUser } from "$lib/utils/permissions";
  import { getProcessLoader } from "../processing/ProcessContext.svelte";
  import { toast } from "../layouts/Toaster.svelte";

  export let files: File[] = getFilesToUpload();
  export let projects: Project[] = [];
  export let user = getCurrentUser();
  export let csrf_token: Maybe<string> = undefined;

  let fileDropActive: boolean;

  /**
   * Upload status
   *
   * Each file gets a random, unique ID so we
   * can track its progress. This also handles cases
   * where multiple files have the same filename.
   */
  let STATUS: Record<string, UploadStatus> = {};
  let loading = false; // are requests in flight?

  // Get load function from processing context
  const loadProcessing = getProcessLoader();

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
  let add_to_projects: Project[] = [getProjectToUpload()].filter(
    Boolean,
  ) as Project[];

  $: total = Object.values(STATUS).reduce((t, status) => {
    return t + status.file.size;
  }, 0);

  $: count = Object.keys(STATUS).length;
  $: empty = count === 0;

  $: exceedsSizeLimit = files.some((file) => !isWithinSizeLimit(file));

  $: disabled = !$user?.verified_journalist || loading || !csrf_token;

  // consume any files passed in
  $: if (files.length > 0) {
    addFiles(files);
    files = [];
  }

  onMount(() => {
    if (!csrf_token) {
      csrf_token = getCsrfToken();
    }
    addFiles(getFilesToUpload());
  });

  beforeNavigate((navigation) => {
    if (!empty && loading) {
      if (!window.confirm($_("uploadDialog.confirmLeave"))) {
        navigation.cancel();
      }
    }
  });

  function uniqueId(): string {
    // random enough for a small set
    return Math.random().toString(32).slice(2);
  }

  function addFiles(filesToAdd: FileList | File[]) {
    STATUS = Array.from(filesToAdd)
      .filter(isSupported)
      .reduce((s, file) => {
        const id = uniqueId();

        s[id] = {
          file,
          step: "ready",
        };

        return s;
      }, STATUS);
  }

  function removeFile(id: string) {
    // splitting this into two lines for readability
    const entries = Object.entries(STATUS).filter(([uid, s]) => uid !== id);
    STATUS = Object.fromEntries(entries);
  }

  function onPaste(e: ClipboardEvent) {
    if (disabled) return;
    const { clipboardData } = e;
    if (!clipboardData) return;
    addFiles(clipboardData.files);
  }

  // handle submit and send each file to upload
  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    loading = true;

    const form = new FormData(e.target as HTMLFormElement);

    const access = (form.get("access") as Access) ?? "private";
    const titles = (form.getAll("title") as string[]) ?? [];
    const revision_control = form.get("revision_control") === "on";

    // only run on files that are "ready" and haven't started uploading
    const promises = Object.entries(STATUS)
      .filter(([id, status]) => status.step === "ready")
      .map(([id, status], i) =>
        upload(
          id,
          {
            title: titles[i] ?? "",
            original_extension: getFileExtension(status.file),
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
    toast($_("uploadDialog.success"), { status: "success" });

    loading = false;
  }

  // upload one file
  async function upload(id: string, metadata: DocumentUpload, form: FormData) {
    if (!csrf_token) return;
    if (!STATUS[id]) return;

    const file = STATUS[id].file;

    // create
    let { data: document, error } = await documents.create(
      metadata,
      csrf_token,
    );

    STATUS[id] = {
      ...STATUS[id],
      document,
      error,
      step: "created",
    };

    // bail here on error, console.error to report this to sentry
    if (error) {
      toast($_("uploadDialog.error"), { status: "error" });
      return console.error(error);
    }

    if (!document || !document.presigned_url) {
      STATUS[id] = {
        ...STATUS[id],
        error: {
          status: 500,
          message: "API returned invalid document. Please try again.",
        },
      };
      toast($_("uploadDialog.error"), { status: "error" });
      return;
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

      STATUS[id].error = error;
      toast($_("uploadDialog.error"), { status: "error" });
      return console.error(error);
    }

    if (!presigned_url) {
      STATUS[id].error = {
        status: 500,
        message: "Invalid presigned URL",
      };
      toast($_("uploadDialog.error"), { status: "error" });
      return;
    }

    STATUS[id].step = "uploading";
    const resp = await documents
      .upload(presigned_url, file)
      .catch(console.error);

    if (!resp) {
      STATUS[id].error = {
        status: 500,
        message: "Upload failed",
      };
      toast($_("uploadDialog.error"), { status: "error" });
      return;
    }

    // process, if we've made it this far with no errors
    STATUS[id].step = "processing";
    const force_ocr = form.get("force_ocr") === "on";

    ({ error } = await documents.process(
      [{ id: document?.id, force_ocr, ocr_engine: ocrEngine?.value }],
      csrf_token,
    ));

    if (error) {
      toast($_("uploadDialog.error"), { status: "error" });
      STATUS[id].error = error;
    }
    // trigger process load request
    loadProcessing?.();
  }
</script>

<svelte:window on:paste={onPaste} />

<Dropzone bind:active={fileDropActive} onDrop={addFiles} {disabled}>
  <form
    method="post"
    enctype="multipart/form-data"
    action="/upload/"
    on:submit={onSubmit}
  >
    <Flex gap={1} align="stretch" wrap>
      <div class="files" class:active={fileDropActive}>
        <header>
          {#if $user?.verified_journalist}
            <h1 class="title">{$_("uploadDialog.title")}</h1>
            <p class="description">
              {$_("uploadDialog.description")}
            </p>
          {:else}
            <Unverified user={$user} />
          {/if}
        </header>
        <div class="fileList" class:empty>
          {#each Object.entries(STATUS) as [id, status] (id)}
            <UploadListItem
              {id}
              {status}
              on:remove={(e) => removeFile(e.detail)}
            />
          {:else}
            <Empty icon={Paperclip24}>
              {$_("uploadDialog.empty")}
            </Empty>
          {/each}
        </div>
        <div class="fileUpload" class:disabled>
          <Flex align="center">
            <FileInput multiple onFileSelect={addFiles} {disabled}>
              <Paperclip16 />
              {$_("uploadDialog.selectFiles")}
            </FileInput>
            {#if count > 0}
              <div class="total">
                <p>
                  {$_("uploadDialog.totalFiles", {
                    values: { n: count },
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
            disabled={disabled || exceedsSizeLimit || empty}
          >
            <Upload16 />{$_("uploadDialog.beginUpload")}
          </Button>

          <Field>
            <FieldLabel>{$_("uploadDialog.accessLevel")}</FieldLabel>
            <AccessLevel name="access" bind:selected={access} required />
          </Field>
          <Field>
            <FieldLabel>{$_("uploadDialog.projects")}</FieldLabel>
            <Select
              name="projects"
              multiple
              options={projects}
              valueField="id"
              labelField="title"
              bind:value={add_to_projects}
              valueAsObject
            />
          </Field>
          <hr class="divider" />
          <Field>
            <FieldLabel>{$_("uploadDialog.language")}</FieldLabel>
            <Language name="language" bind:value={language} />
          </Field>
          {#if ocrEngine}
            <Field>
              <FieldLabel>{$_("uploadDialog.ocrEngine")}</FieldLabel>
              <Select
                name="ocr_engine"
                options={ocrEngineOptions}
                bind:value={ocrEngine}
                valueAsObject
              />
              <p slot="help">
                {@html ocrEngine.help}
              </p>
            </Field>
          {/if}
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
              <FieldLabel premium>
                {$_("uploadDialog.revisionControl")}
              </FieldLabel>
              <p slot="help">
                {$_("uploadDialog.revisionControlHelp")}
              </p>
            </Field>
          </Premium>
        </Flex>
      </div>
    </Flex>
  </form>
</Dropzone>

<style>
  header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 1rem;
  }

  .title {
    font-size: var(--font-xl);
    font-weight: var(--font-semibold);
  }

  .description {
    opacity: 0.7;
  }

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
</style>
