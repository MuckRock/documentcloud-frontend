<script lang="ts" context="module">
  import type { Document, Note as NoteType } from "$lib/api/types";

  import { Story, Template } from "@storybook/addon-svelte-csf";
  import NoteTitle from "../NoteTitle.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";

  const document = doc as Document;
  const notes = document.notes as NoteType[];

  export const meta = {
    title: "Components / Note / Title",
    component: NoteTitle,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <NoteTitle {...args} />
</Template>

<Story name="Default" args={{ doc: document, note: notes[0] }} />
<Story
  name="Page Level Note"
  args={{
    doc: document,
    note: { ...notes[0], x1: null, x2: null, y1: null, y2: null },
  }}
/>
<Story
  name="Embedded Title"
  args={{ doc: document, note: notes[0], embed: true }}
/>
<Story
  name="Long Title"
  args={{
    doc: document,
    note: {
      ...notes[0],
      title:
        "This is a very long note title that should wrap properly and demonstrate how the component handles lengthy text content",
    },
  }}
/>
