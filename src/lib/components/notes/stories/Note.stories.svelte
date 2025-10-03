<script lang="ts" context="module">
  import type { Document, Note as NoteType } from "$lib/api/types";

  import * as pdfjs from "pdfjs-dist/build/pdf.mjs";
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url,
  ).href;

  import { Story, Template } from "@storybook/addon-svelte-csf";
  import ViewerContext from "../../viewer/ViewerContext.svelte";
  import Note from "../Note.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  import pdfFile from "@/test/fixtures/documents/examples/agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government.pdf";
  import { writable } from "svelte/store";
  import { pdfUrl } from "$lib/api/documents";

  const document = doc as Document;
  const notes = document.notes as NoteType[];
  const url = new URL(pdfFile, import.meta.url);

  const page_note = { ...notes[0], x1: null, x2: null, y1: null, y2: null };

  const html = `A chance for the Prime Minister and his Deputy to portray themselves as the "<b>action men</b>" of British politics.  
  Within a month-and-a-half, <a href="https://en.wikipedia.org/wiki/George_Osborne">George Osborne</a>, the country's new 38 year-old Chancellor of the Exchequor (i.e. the country's Finance Minister) 
  will present a budget to Parliament that calls for emergency actions to reduce Britain's forecast $280 billion deficit.`;

  export const meta = {
    title: "Components / Note",
    component: Note,
    parameters: { layout: "centered" },
  };

  async function load(url: URL) {
    return pdfjs.getDocument(url).promise;
  }
</script>

<script lang="ts">
</script>

<Template let:args>
  <ViewerContext
    {document}
    asset_url={pdfUrl(document)}
    pdf={args.pdf ?? undefined}
  >
    <Note {...args} />
  </ViewerContext>
</Template>

<Story name="default" args={{ note: notes[0] }} />
<Story name="page-level note" args={{ note: page_note }} />
<Story name="editable" args={{ note: { ...notes[1], edit_access: true } }} />
<Story
  name="private access"
  args={{ note: { ...notes[1], access: "private" } }}
/>
<Story
  name="collaborators access"
  args={{ note: { ...notes[1], access: "organization" } }}
/>
<Story name="note with HTML" args={{ note: { ...notes[2], content: html } }} />
<Story
  name="render using PDF"
  args={{ pdf: writable(load(url)), note: { ...notes[2], content: html } }}
/>
