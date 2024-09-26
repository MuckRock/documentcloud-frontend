<script lang="ts" context="module">
  import type { Document, Note as NoteType } from "$lib/api/types";

  import * as pdfjs from "pdfjs-dist/build/pdf.mjs";
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url,
  ).href;

  import { Story } from "@storybook/addon-svelte-csf";
  import { setContext } from "svelte";
  import Note from "../Note.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  import pdfFile from "@/test/fixtures/documents/examples/agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government.pdf";

  const document = doc as Document;
  const notes = document.notes as NoteType[];
  const url = new URL(pdfFile, import.meta.url);

  const page_note = { ...notes[0], x1: null, x2: null, y1: null, y2: null };

  const html = `A chance for the Prime Minister and his Deputy to portray themselves as the "<b>action men</b>" of British politics.  
  Within a month-and-a-half, <a href="https://en.wikipedia.org/wiki/George_Osborne">George Osborne</a>, the country's new 38 year-old Chancellor of the Exchequor (i.e. the country's Finance Minister) 
  will present a budget to Parliament that calls for emergency actions to reduce Britain's forecast $280 billion deficit.`;

  export const meta = {
    title: "Components / Viewer / Note",
    component: Note,
    parameters: { layout: "centered" },
  };

  async function load(url: URL) {
    return pdfjs.getDocument(url).promise;
  }
</script>

<script lang="ts">
  setContext("document", document);
</script>

<Story name="default">
  <Note {document} note={notes[0]} />
</Story>

<Story name="page-level note">
  <Note {document} note={page_note} />
</Story>

<Story name="editable">
  <Note {document} note={{ ...notes[1], edit_access: true }} />
</Story>

<Story name="private access">
  <Note {document} note={{ ...notes[1], access: "private" }} />
</Story>

<Story name="collaborators access">
  <Note {document} note={{ ...notes[1], access: "organization" }} />
</Story>

<Story name="note with HTML">
  <Note {document} note={{ ...notes[2], content: html }} />
</Story>

<Story name="render using PDF">
  {#await load(url) then pdf}
    <Note {document} note={{ ...notes[2], content: html }} {pdf} />
  {/await}
</Story>
