<script lang="ts" context="module">
  import type { Document, Note as NoteType } from "$lib/api/types";

  import { Story, Template } from "@storybook/addon-svelte-csf";
  import NoteActions from "../NoteActions.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";

  const document = doc as Document;
  const notes = document.notes as NoteType[];

  export const meta = {
    title: "Note / Actions",
    component: NoteActions,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <NoteActions {...args} />
</Template>

<Story
  name="Default"
  args={{ doc: document, note: notes[0], onShare: () => {} }}
/>
<Story
  name="Private Access"
  args={{
    doc: document,
    note: { ...notes[0], access: "private" },
    onShare: () => {},
  }}
/>
<Story
  name="Organization Access"
  args={{
    doc: document,
    note: { ...notes[0], access: "organization" },
    onShare: () => {},
  }}
/>
<Story
  name="Public Access"
  args={{
    doc: document,
    note: { ...notes[0], access: "public" },
    onShare: () => {},
  }}
/>
<Story
  name="With Edit Permission"
  args={{ doc: document, note: notes[0], canEdit: true, onShare: () => {} }}
/>
<Story
  name="No Share Permission"
  args={{ doc: document, note: notes[0], canShare: false, onShare: () => {} }}
/>
<Story
  name="Edit and Share Enabled"
  args={{
    doc: document,
    note: notes[0],
    canEdit: true,
    canShare: true,
    onShare: () => {},
  }}
/>
<Story
  name="No Actions Available"
  args={{
    doc: document,
    note: notes[0],
    canEdit: false,
    canShare: false,
    onShare: () => {},
  }}
/>
