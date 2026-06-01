<script module lang="ts">
  import type { Document, Note as NoteType } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import NoteTitle from "../NoteTitle.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";

  const document = doc as Document;
  const notes = document.notes as NoteType[];
  const note0 = notes[0]!;

  const { Story } = defineMeta({
    title: "Notes / Title",
    component: NoteTitle,
    parameters: { layout: "centered" },
  });
</script>

<Story name="Default" args={{ doc: document, note: note0 }} />
<Story
  name="Page Level Note"
  args={{
    doc: document,
    note: {
      ...note0,
      x1: null,
      x2: null,
      y1: null,
      y2: null,
    } as unknown as NoteType,
  }}
/>
<Story
  name="Embedded Title"
  args={{ doc: document, note: note0, embed: true }}
/>
<Story
  name="Long Title"
  args={{
    doc: document,
    note: {
      ...note0,
      title:
        "This is a very long note title that should wrap properly and demonstrate how the component handles lengthy text content",
    },
  }}
/>
