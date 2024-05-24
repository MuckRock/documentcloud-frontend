<script context="module" lang="ts">
  import type { Note as NoteType } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import { setContext } from "svelte";

  import Notes from "../Notes.svelte";

  export const meta = {
    title: "Components / Documents / Notes View",
    component: Notes,
    parameters: { layout: "centered" },
  };

  import document from "$lib/api/fixtures/documents/document-expanded.json";
  import pdfFile from "$lib/api/fixtures/documents/examples/agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government.pdf";

  const notes = document.notes as NoteType[];
  const url = new URL(pdfFile, import.meta.url);
</script>

<script lang="ts">
  setContext("document", document);
</script>

<Story name="notes using images">
  <Notes {notes} />
</Story>

<Story name="notes using a PDF file">
  <Notes {notes} asset_url={url} />
</Story>
