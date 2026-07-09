<script module lang="ts">
  import type { Document } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import EditNote from "../EditNote.svelte";

  const { Story } = defineMeta({
    title: "Forms / Edit note",
    component: EditNote,
    parameters: {
      layout: "centered",
    },
  });

  import doc from "@/test/fixtures/documents/document-expanded.json";

  const document = doc as Document;
  const note = document.notes?.[0]!;
</script>

<Story name="New note" args={{ document, page_number: note.page_number }} />

<Story
  name="Update note"
  args={{ document, note, page_number: note.page_number }}
/>
