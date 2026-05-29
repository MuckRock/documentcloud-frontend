<script module lang="ts">
  import type { Document, Note as NoteType } from "$lib/api/types";
  import type { ComponentProps } from "svelte";

  import * as pdfjs from "pdfjs-dist/build/pdf.mjs";
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url,
  ).href;

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ViewerContext from "../../viewer/ViewerContext.svelte";
  import NoteExcerpt from "../NoteExcerpt.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  import { pdfUrl } from "$lib/api/documents";

  const document = doc as Document;
  const notes = document.notes as NoteType[];
  const note0 = notes[0]!;
  const note1 = notes[1]!;

  const { Story } = defineMeta({
    title: "Notes / Excerpt",
    component: NoteExcerpt,
    parameters: { layout: "centered" },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof NoteExcerpt>)}
  <ViewerContext {document} asset_url={pdfUrl(document)}>
    <NoteExcerpt {...args} />
  </ViewerContext>
{/snippet}

<Story name="Default" args={{ note: note0 }} />
<Story name="Private Access" args={{ note: { ...note1, access: "private" } }} />
<Story
  name="Organization Access"
  args={{ note: { ...note1, access: "organization" } }}
/>
<Story name="Public Access" args={{ note: { ...note1, access: "public" } }} />
