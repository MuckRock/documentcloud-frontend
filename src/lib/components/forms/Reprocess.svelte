<!-- @component
Reprocess a document, with options to force OCR and set a new language.

This will mostly be used inside a modal but isn't dependent on one.
-->
<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import Field from "../common/Field.svelte";
  import FieldLabel from "../common/FieldLabel.svelte";
  import Flex from "../common/Flex.svelte";
  import Language from "../inputs/Language.svelte";
  import Select, { unwrap } from "../inputs/Select.svelte";
  import { IssueReopened16 } from "svelte-octicons";

  export let documents: Document[] = [];

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
</script>

<form method="post" on:submit on:reset>
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
