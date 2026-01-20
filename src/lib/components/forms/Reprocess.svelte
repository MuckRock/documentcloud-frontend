<!-- @component
Reprocess a document, with options to force OCR and set a new language.

This will mostly be used inside a modal but isn't dependent on one.
-->
<script lang="ts">
  import type { Document, Status, APIError, Maybe } from "$lib/api/types";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";
  import { Alert24, IssueReopened16 } from "svelte-octicons";

  import { invalidateAll } from "$app/navigation";

  import Button from "../common/Button.svelte";
  import Field from "../common/Field.svelte";
  import FieldLabel from "../common/FieldLabel.svelte";
  import Flex from "../common/Flex.svelte";
  import Language from "../inputs/Language.svelte";
  import Select from "../inputs/Select.svelte";
  import ShowSize from "../common/ShowSize.svelte";
  import Tip from "../common/Tip.svelte";

  import {
    DEFAULT_LANGUAGE,
    LANGUAGE_MAP,
    MAX_EDIT_BATCH,
  } from "@/config/config.js";
  import { process, cancel, edit_many } from "$lib/api/documents";
  import { load } from "$lib/components/processing/ProcessContext.svelte";
  import { getCsrfToken } from "$lib/utils/api";

  export let documents: Document[] = [];

  const dispatch = createEventDispatcher();

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
  let language: { value: string; label: string } = {
    value: documents[0]?.language ?? DEFAULT_LANGUAGE,
    label: LANGUAGE_MAP.get(documents[0]?.language),
  };

  // exported for testing and demos
  export let errors: Maybe<APIError<string[]>> = undefined;

  let force_ocr = false;
  let submitting = false;

  // todo: warn if documents are in more than one language
  $: multilingual = new Set(documents.map((d) => d.language)).size > 1;
  $: pending = documents.filter((d) => d.status === "pending");
  $: disabled = submitting || documents.length > MAX_EDIT_BATCH;

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    submitting = true; // while submitting

    const csrf_token = getCsrfToken();
    if (!csrf_token) {
      errors = {
        status: 403,
        message:
          "Could not begin reprocessing. Please refresh this page and try again.",
        errors: ["Missing CSRF token"],
      };
      return console.error(errors);
    }

    const pending = documents.filter((d) =>
      new Set<Status>(["pending", "readable"]).has(d.status),
    );

    // cancel anything pending, with an empty catch because they might be done by the time this runs
    await Promise.all(pending.map((d) => cancel(d, csrf_token))).catch(
      console.error,
    );

    // maybe update language
    const language_updates = documents
      .filter((d) => d.language !== language.value)
      .map((d) => ({ id: d.id, language: language.value }));

    if (language_updates.length > 0) {
      const { error: edit_error } = await edit_many(
        documents
          .filter((d) => d.language !== language.value)
          .map((d) => ({ id: d.id, language: language.value })),
        csrf_token,
      );

      if (edit_error) {
        errors = {
          message: edit_error.message,
          status: edit_error.status,
        };

        // can't proceed, so bail
        return console.error(errors);
      }
    }

    // send it
    const payload = documents.map((d) => ({
      id: d.id,
      force_ocr,
      ocr_engine: ocrEngine?.value,
    }));

    const { error } = await process(payload, csrf_token);

    if (!error) {
      load();
      invalidateAll(); // just refetch all the things
      dispatch("close"); // closing destroys the component
    } else {
      errors = error;
      console.error(error);
      submitting = false; // now you can try again
    }
  }
</script>

<form class="modal-form--flex" method="post" on:submit={onSubmit}>
  <Flex direction="column" gap={1.5}>
    <!-- Add any header and messaging using this slot -->
    <slot>
      <header>
        <h2>
          {$_("dialogReprocessDialog.title")}
        </h2>
      </header>
    </slot>
    {#if errors}
      <Tip mode="error">
        <Alert24 slot="icon" />
        <p>{errors.message}</p>
        {#if errors.errors}
          <ul>
            {#each errors.errors as e}
              <li>{e}</li>
            {/each}
          </ul>
        {/if}
      </Tip>
    {/if}

    {#if pending.length > 0}
      <Tip mode="error">
        <Alert24 slot="icon" />
        <p>{$_("dialogReprocessDialog.pending")}</p>
        <ul>
          {#each pending as document}
            <li>{document.title}</li>
          {/each}
        </ul>
      </Tip>
    {/if}

    {#if multilingual}
      <Tip mode="danger">
        <Alert24 slot="icon" />
        <p>{$_("dialogReprocessDialog.multilingual")}</p>
      </Tip>
    {/if}

    <Flex direction="column" gap={1}>
      <Field>
        <FieldLabel>{$_("uploadDialog.language")}</FieldLabel>
        <Language bind:value={language} />
      </Field>
      <Field>
        <FieldLabel>{$_("uploadDialog.ocrEngine")}</FieldLabel>
        <Select
          name="ocr_engine"
          options={ocrEngineOptions}
          bind:value={ocrEngine}
          valueAsObject
        />
        <p slot="help">
          {@html ocrEngine?.help}
        </p>
      </Field>
      <Field inline>
        <input type="checkbox" name="force_ocr" bind:checked={force_ocr} />
        <FieldLabel>{$_("uploadDialog.forceOcr")}</FieldLabel>
      </Field>
    </Flex>
    <Flex direction="column">
      {#if documents.length === 1}
        <p class="disclaimer">
          {$_("dialogReprocessDialog.reprocessSingleDoc")}
        </p>
      {:else}
        <ShowSize size={documents.length}>
          {$_("dialogReprocessDialog.reprocessDocs", {
            values: { n: documents.length },
          })}

          <Tip mode="danger" slot="oversize">
            <Alert24 slot="icon" />
            {$_("dialogReprocessDialog.toomany", {
              values: { max: MAX_EDIT_BATCH, n: documents.length },
            })}
          </Tip>
        </ShowSize>
      {/if}
      <ul class="documents">
        {#each documents as document}
          <li class:pending={document.status === "pending"}>
            {document.title}
            {#if document.status === "pending"}
              (pending)
            {/if}
          </li>
        {/each}
      </ul>
      {#if documents.length <= MAX_EDIT_BATCH}
        <p class="disclaimer">{$_("dialogReprocessDialog.continue")}</p>
      {/if}
    </Flex>
    <Flex class="buttons">
      <Button {disabled} type="submit" full mode="danger">
        <IssueReopened16 />{$_("dialogReprocessDialog.confirm")}
      </Button>
      <Button full on:click={() => dispatch("close")}>
        {$_("edit.cancel")}
      </Button>
    </Flex>
  </Flex>
</form>

<style>
  form {
    gap: 0.5rem;
  }

  .disclaimer {
    line-height: 1.4;
    color: var(--gray-4);
    font-size: var(--font-md);
  }

  li.pending {
    color: var(--error);
  }
</style>
