<script lang="ts" context="module">
  import type { Document, Note as NoteType } from "$lib/api/types";

  import * as pdfjs from "pdfjs-dist/build/pdf.mjs";
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url,
  ).href;

  import { Story, Template } from "@storybook/addon-svelte-csf";
  import ViewerContext from "../../viewer/ViewerContext.svelte";
  import NoteExcerpt from "../NoteExcerpt.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  import { pdfUrl } from "$lib/api/documents";

  const document = doc as Document;
  const notes = document.notes as NoteType[];

  export const meta = {
    title: "Notes / Excerpt",
    component: NoteExcerpt,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <ViewerContext {document} asset_url={pdfUrl(document)}>
    <NoteExcerpt {...args} />
  </ViewerContext>
</Template>

<Story name="Default" args={{ note: notes[0] }} />
<Story
  name="Private Access"
  args={{ note: { ...notes[1], access: "private" } }}
/>
<Story
  name="Organization Access"
  args={{ note: { ...notes[1], access: "organization" } }}
/>
<Story
  name="Public Access"
  args={{ note: { ...notes[1], access: "public" } }}
/>
