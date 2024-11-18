<!-- @component
Reprocess a document, with options to force OCR and set a new language.

This will mostly be used inside a modal but isn't dependent on one.
-->
<script lang="ts">
  import type { Document, Status } from "$lib/api/types";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";
  import { IssueReopened16 } from "svelte-octicons";

  import { invalidateAll } from "$app/navigation";

  import Button from "../common/Button.svelte";
  import Field from "../common/Field.svelte";
  import FieldLabel from "../common/FieldLabel.svelte";
  import Flex from "../common/Flex.svelte";
  import Language from "../inputs/Language.svelte";
  import Select from "../inputs/Select.svelte";

  import { DEFAULT_LANGUAGE, LANGUAGE_MAP } from "@/config/config.js";
  import { process, cancel, edit } from "$lib/api/documents";
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

  let errors: unknown;
  let force_ocr = false;
  let form: HTMLFormElement;
  let submitting = false;

  // todo: warn if documents are in more than one language
  $: multilingual = new Set(documents.map((d) => d.language)).size > 1;
  $: console.log(language);

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    submitting = true; // while submitting

    const csrf_token = getCsrfToken();
    if (!csrf_token) {
      throw new Error("missing csrf_token");
    }

    const pending = documents.filter((d) =>
      new Set<Status>(["pending", "readable"]).has(d.status),
    );

    // cancel anything pending, with an empty catch because they might be done by the time this runs
    await Promise.all(pending.map((d) => cancel(d, csrf_token))).catch();

    // maybe update language
    await Promise.all(
      documents
        .filter((d) => d.language !== language.value)
        .map((d) => edit(d.id, { language: language.value }, csrf_token)),
    ).catch(console.error);

    // send it
    const payload = documents.map((d) => ({
      id: d.id,
      force_ocr,
      ocr_engine: ocrEngine?.value,
    }));

    const { error } = await process(payload, csrf_token);

    if (!error) {
      load();
      await invalidateAll(); // just refetch all the things
      dispatch("close"); // closing destroys the component
    } else {
      console.error(error);
      submitting = false; // now you can try again
    }
  }
</script>

<form method="post" on:submit={onSubmit} bind:this={form}>
  <Flex direction="column" gap={1.5}>
    <!-- Add any header and messaging using this slot -->
    <slot />
    <!-- todo: figure out what errors are possible with reprocessing
      {#if errors.length > 0}
      <div class="errors">
        <ul>
          {#each errors as e}
          <li>{e}</li>
          {/each}
        </ul>
      </div>
      {/if}
      -->
    <Flex direction="column" gap={1}>
      <Field>
        <FieldLabel>{$_("uploadDialog.language")}</FieldLabel>
        <Language bind:value={language} />
      </Field>
      <Field>
        <FieldLabel>{$_("uploadDialog.ocrEngine")}</FieldLabel>
        <Select
          name="ocr_engine"
          items={ocrEngineOptions}
          bind:value={ocrEngine}
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
        <p class="disclaimer">
          {$_("dialogReprocessDialog.reprocessDocs", {
            values: { n: documents.length },
          })}
        </p>
      {/if}
      <ul class="documents">
        {#each documents as document}
          <li>{document.title}</li>
        {/each}
      </ul>
      <p class="disclaimer">{$_("dialogReprocessDialog.continue")}</p>
    </Flex>
    <Flex class="buttons">
      <Button disabled={submitting} type="submit" full mode="danger"
        ><IssueReopened16 />{$_("dialogReprocessDialog.confirm")}
      </Button>
      <Button full on:click={() => dispatch("close")}
        >{$_("edit.cancel")}
      </Button>
    </Flex>
  </Flex>
</form>

<style>
  form {
    display: flex;
    flex-flow: column nowrap;
    gap: 0.5rem;
    width: 100%;
  }

  .disclaimer {
    line-height: 1.4;
    color: var(--gray-4);
    font-size: var(--font-md);
  }

  /*
  .errors li {
    color: var(--red-3);
  }
  */
</style>
