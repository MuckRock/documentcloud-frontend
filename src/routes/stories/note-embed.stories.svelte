<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import NoteEmbed from "../(embed)/documents/[id]/annotations/[note_id]/+page.svelte";

  import document from "$lib/api/fixtures/documents/document-expanded.json";
  import note from "$lib/api/fixtures/notes/note-expanded.json";
  import notes from "$lib/api/fixtures/notes/notes-expanded.json";

  export const meta = {
    title: "Embed / Note",
    component: NoteEmbed,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  const data = { note, document };
</script>

<Story name="default">
  <NoteEmbed {data} />
</Story>

<Story name="bigger note">
  <NoteEmbed data={{ document, note: notes.results[1] }} />
</Story>
