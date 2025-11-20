<script lang="ts" context="module">
  import type { Document, Note as NoteType } from "$lib/api/types";

  import { Story, Template } from "@storybook/addon-svelte-csf";
  import NoteMetadata from "../NoteMetadata.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";

  const document = doc as Document;
  const notes = document.notes as NoteType[];

  export const meta = {
    title: "Note / Metadata",
    component: NoteMetadata,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <NoteMetadata {...args} />
</Template>

<Story name="Default" args={{ note: notes[0] }} />
<Story
  name="Recently Updated"
  args={{ note: { ...notes[0], updated_at: new Date().toISOString() } }}
/>
<Story
  name="Never Updated"
  args={{ note: { ...notes[0], updated_at: notes[0]?.created_at } }}
/>
<Story
  name="No User Information"
  args={{ note: { ...notes[0], user: null } }}
/>
