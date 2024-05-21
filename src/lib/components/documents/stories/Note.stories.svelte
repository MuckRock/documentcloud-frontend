<script lang="ts" context="module">
  import type { Note as NoteType } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import Note from "../Note.svelte";

  import document from "$lib/api/fixtures/documents/document-expanded.json";

  const notes = document.notes as NoteType[];

  export const meta = {
    title: "Components / Documents / Note",
    component: Note,
    parameters: { layout: "centered" },
  };
</script>

<Story name="small">
  <Note focused note={notes[0]} />
</Story>

<Story name="bigger">
  <Note focused note={notes[1]} />
</Story>
