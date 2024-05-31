<script context="module" lang="ts">
  import type { Document } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import { setContext } from "svelte";

  import Notes from "../Notes.svelte";

  export const meta = {
    title: "Components / Documents / Notes View",
    component: Notes,
    parameters: { layout: "centered" },
  };

  import doc from "$lib/api/fixtures/documents/document-expanded.json";
  import pdfFile from "$lib/api/fixtures/documents/examples/agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government.pdf";

  const document = doc as Document;
  const url = new URL(pdfFile, import.meta.url);
</script>

<script lang="ts">
  setContext("document", document);
</script>

<Story name="notes using images">
  <Notes {document} />
</Story>

<Story name="notes using a PDF file">
  <Notes {document} asset_url={url} />
</Story>

<Story name="no notes">
  <Notes document={{ ...document, notes: [] }} />
</Story>
