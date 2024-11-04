<script context="module" lang="ts">
  import type { APIError, Document } from "$lib/api/types";

  type Step = "ready" | "created" | "uploading" | "processing" | "done";

  /**
   * Keep track of a file as it moves through our three-step upload process
   */
  export type UploadStatus = {
    file: File;
    step: Step;
    document?: Document;
    error?: APIError<unknown>;
  };
</script>

<script lang="ts">
  import { filesize } from "filesize";
  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";
  import { Alert16, Check16, Sync16, XCircleFill24 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import Field from "../inputs/Field.svelte";
  import Text from "../inputs/Text.svelte";
  import Tooltip from "../common/Tooltip.svelte";

  import { canonicalUrl } from "$lib/api/documents";

  import {
    filenameToTitle,
    getFileExtension,
    isWithinSizeLimit,
  } from "$lib/utils/files";

  const dispatch = createEventDispatcher();

  export let id: string;
  export let status: UploadStatus;

  // i18n
  const steps: Record<Step, string> = {
    ready: $_("uploadDialog.steps.ready"),
    created: $_("uploadDialog.steps.created"),
    uploading: $_("uploadDialog.steps.uploading"),
    processing: $_("uploadDialog.steps.processing"),
    done: $_("uploadDialog.steps.done"),
  };

  $: file = status.file;
  $: step = steps[status.step];
  $: description = status?.error ? `${file.name}` : `${file.name}: ${step}`;
  $: loading = ["created", "uploading"].includes(status.step);
  $: linkable =
    status?.document && ["processing", "done"].includes(status?.step);
</script>

<!-- file is ready, uploading or processing -->
<Flex align="baseline" gap={1} role="listitem" class="upload-list-item" {id}>
  <div class="title">
    {#if linkable && status.document}
      <a href={canonicalUrl(status.document).href}>{status.document?.title}</a>
    {:else}
      <Field inline sronly title={$_("common.title")} {description}>
        <Text
          name="title"
          value={filenameToTitle(file.name)}
          disabled={loading || Boolean(status?.error)}
          required
        />
        <svelte:fragment slot="error">
          {#if status?.error}
            <p class="error">
              {status?.error.message}
              <Button
                ghost
                minW={false}
                on:click={() => dispatch("remove", id)}
              >
                {$_("dialog.remove")}?
              </Button>
            </p>
          {/if}
        </svelte:fragment>
      </Field>
    {/if}
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
        <Alert16 fill="var(--error)" />
      </Tooltip>
    {/if}
  </p>

  {#if loading}
    <Sync16 class="spin" />
  {:else if status?.error}
    <span class="error" style:display="contents">
      <Alert16 />
    </span>
  {:else if linkable}
    <Check16 />
  {:else}
    <Button
      minW={false}
      ghost
      title={$_("dialog.remove")}
      on:click={() => dispatch("remove", id)}
    >
      <XCircleFill24 />
    </Button>
  {/if}
</Flex>

<style>
  .title {
    flex: 1 0 auto;
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
    color: var(--error);
  }

  .error {
    color: var(--error);
    fill: var(--error);
  }

  p.error {
    margin: 0.5rem 0;
    font-size: var(--font-sm, 0.875em);
  }
</style>
