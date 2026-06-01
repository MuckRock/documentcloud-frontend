<script module lang="ts">
  import type { Document, Note as NoteType } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import NoteActions from "../NoteActions.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";

  const document = doc as Document;
  const notes = document.notes as NoteType[];
  const note0 = notes[0]!;

  const { Story } = defineMeta({
    title: "Notes / Actions",
    component: NoteActions,
    parameters: { layout: "centered" },
  });
</script>

<Story
  name="Default"
  args={{ doc: document, note: note0, onShare: () => {} }}
/>
<Story
  name="Private Access"
  args={{
    doc: document,
    note: { ...note0, access: "private" },
    onShare: () => {},
  }}
/>
<Story
  name="Organization Access"
  args={{
    doc: document,
    note: { ...note0, access: "organization" },
    onShare: () => {},
  }}
/>
<Story
  name="Public Access"
  args={{
    doc: document,
    note: { ...note0, access: "public" },
    onShare: () => {},
  }}
/>
<Story
  name="With Edit Permission"
  args={{ doc: document, note: note0, canEdit: true, onShare: () => {} }}
/>
<Story
  name="No Share Permission"
  args={{ doc: document, note: note0, canShare: false, onShare: () => {} }}
/>
<Story
  name="Edit and Share Enabled"
  args={{
    doc: document,
    note: note0,
    canEdit: true,
    canShare: true,
    onShare: () => {},
  }}
/>
<Story
  name="No Actions Available"
  args={{
    doc: document,
    note: note0,
    canEdit: false,
    canShare: false,
    onShare: () => {},
  }}
/>
