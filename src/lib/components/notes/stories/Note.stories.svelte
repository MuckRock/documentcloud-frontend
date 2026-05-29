<script module lang="ts">
  import type { Document, Note as NoteType } from "$lib/api/types";
  import type { ComponentProps } from "svelte";

  import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.mjs",
    import.meta.url,
  ).href;

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ViewerContext from "../../viewer/ViewerContext.svelte";
  import Note from "../Note.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  import pdfFile from "@/test/fixtures/documents/examples/agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government.pdf";
  import cji from "@/test/fixtures/documents/examples/cji.json";
  import cjiPdf from "@/test/fixtures/documents/examples/signed-fair-fight-foundation-settlement-2024.pdf";
  import { writable } from "svelte/store";
  import { pdfUrl } from "$lib/api/documents";

  const document = doc as Document;
  const notes = document.notes as NoteType[];
  const note0 = notes[0]!;
  const note1 = notes[1]!;
  const note2 = notes[2]!;
  const url = new URL(pdfFile, import.meta.url);

  const page_note = {
    ...note0,
    x1: null,
    x2: null,
    y1: null,
    y2: null,
  } as unknown as NoteType;

  const html = `A chance for the Prime Minister and his Deputy to portray themselves as the "<b>action men</b>" of British politics.
  Within a month-and-a-half, <a href="https://en.wikipedia.org/wiki/George_Osborne">George Osborne</a>, the country's new 38 year-old Chancellor of the Exchequor (i.e. the country's Finance Minister)
  will present a budget to Parliament that calls for emergency actions to reduce Britain's forecast $280 billion deficit.`;

  async function load(url: URL) {
    return pdfjs.getDocument(url).promise;
  }

  const CJI = {
    document: cji as Document,
    note: cji.notes.find((n) => n.id === 2587355) as NoteType,
    url: new URL(cjiPdf, import.meta.url),
  };

  const { Story } = defineMeta({
    title: "Notes / Note",
    component: Note,
    parameters: { layout: "centered" },
    render: template,
  });

  type Args = ComponentProps<typeof Note> & {
    pdf?: ComponentProps<typeof ViewerContext>["pdf"];
  };
</script>

{#snippet template({ pdf, ...args }: Args)}
  <ViewerContext {document} asset_url={pdfUrl(document)} {pdf}>
    <Note {...args} />
  </ViewerContext>
{/snippet}

<Story name="default" args={{ note: note0 }} />

<Story name="page-level note" args={{ note: page_note }} />

<Story name="editable" args={{ note: { ...note1, edit_access: true } }} />

<Story name="private access" args={{ note: { ...note1, access: "private" } }} />

<Story
  name="collaborators access"
  args={{ note: { ...note1, access: "organization" } }}
/>

<Story name="note with HTML" args={{ note: { ...note2, content: html } }} />

<Story
  name="render using PDF"
  args={{ pdf: writable(load(url)), note: { ...note2, content: html } }}
/>

<Story name="Excerpt from rotated page" asChild>
  <ViewerContext
    document={CJI.document}
    asset_url={pdfUrl(CJI.document)}
    pdf={writable(load(CJI.url))}
  >
    <Note document={writable(CJI.document)} note={CJI.note} scale={2} />
  </ViewerContext>
</Story>
