<script module lang="ts">
  import type { Document, Note as NoteType } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import NoteMetadata from "../NoteMetadata.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";

  const document = doc as Document;
  const notes = document.notes as NoteType[];
  const note0 = notes[0]!;

  const { Story } = defineMeta({
    title: "Notes / Metadata",
    component: NoteMetadata,
    parameters: { layout: "centered" },
  });
</script>

<Story name="Default" args={{ note: note0 }} />
<Story
  name="Recently Updated"
  args={{ note: { ...note0, updated_at: "2025-12-11T17:15:11.689Z" } }}
/>
<Story
  name="Never Updated"
  args={{ note: { ...note0, updated_at: note0.created_at } }}
/>
<Story
  name="No User Information"
  args={{ note: { ...note0, user: null } as unknown as NoteType }}
/>
