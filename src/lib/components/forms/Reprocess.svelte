<!-- @component
Reprocess a document, with options to force OCR and set a new language.

This will mostly be used inside a modal but isn't dependent on one.
-->
<script lang="ts">
  import type { Document, Status } from "$lib/api/types";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";
  import { IssueReopened16 } from "svelte-octicons";

  import { invalidate } from "$app/navigation";
  import { page } from "$app/stores";

  import Button from "../common/Button.svelte";
  import Field from "../common/Field.svelte";
  import FieldLabel from "../common/FieldLabel.svelte";
  import Flex from "../common/Flex.svelte";
  import Language from "../inputs/Language.svelte";
  import Select, { unwrap } from "../inputs/Select.svelte";

  import { process, cancel } from "$lib/api/documents";

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
  let language: { value: string; label: string };
  let force_ocr = false;

  let form: HTMLFormElement;

  async function onSubmit(e: SubmitEvent) {
    const { csrf_token } = $page.data;
    const pending = documents.filter((d) =>
      new Set<Status>(["pending", "readable"]).has(d.status),
    );

    // cancel anything pending
    await Promise.all(pending.map((d) => cancel(d, csrf_token)));

    // send it
    const payload = documents.map((d) => ({
      id: d.id,
      force_ocr,
      language: language.value,
      ocr_engine: ocrEngine.value,
    }));

    const resp = await process(payload, csrf_token);

    if (resp.ok) {
      invalidate($page.url);
      dispatch("close");
    } else {
      // show errors
    }
  }
</script>

<form method="post" on:submit|preventDefault={onSubmit} bind:this={form}>
  <Flex direction="column">
    <header>
      <h2>
        {$_("dialogReprocessDialog.title")}
      </h2>
      {#if documents.length === 1}
        <p>{$_("dialogReprocessDialog.reprocessSingleDoc")}</p>
      {:else}
        <p>
          {$_("dialogReprocessDialog.reprocessDocs", {
            values: { n: documents.length },
          })}
        </p>
      {/if}
    </header>
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
        {@html ocrEngine.help}
      </p>
    </Field>
    <Field inline>
      <input type="checkbox" name="force_ocr" bind:checked={force_ocr} />
      <FieldLabel>{$_("uploadDialog.forceOcr")}</FieldLabel>
    </Field>
  </Flex>
  <Button type="submit" full mode="primary"
    ><IssueReopened16 />{$_("dialogReprocessDialog.confirm")}</Button
  >
</form>

<style>
  header,
  form {
    display: flex;
    flex-flow: column nowrap;
    gap: 0.5rem;
  }
</style>
