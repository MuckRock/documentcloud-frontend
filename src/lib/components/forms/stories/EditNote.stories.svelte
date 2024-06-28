<script context="module" lang="ts">
  import type { Bounds, Document } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import EditNote from "../EditNote.svelte";

  export const meta = {
    title: "Forms / Edit note",
    component: EditNote,
  };

  import doc from "$lib/api/fixtures/documents/document-expanded.json";

  const document = doc as Document;
  const note = document.notes[0];
  const coords = [note.x1, note.x2, note.y1, note.y2] as Bounds;
</script>

<Story name="New note">
  <EditNote {document} page_number={note.page_number} />
</Story>

<Story name="Update note">
  <EditNote {document} {note} {coords} page_number={note.page_number} />
</Story>
