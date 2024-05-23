<script lang="ts" context="module">
  import type { Note as NoteType } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import { setContext } from "svelte";
  import Note from "../Note.svelte";

  import document from "$lib/api/fixtures/documents/document-expanded.json";

  const notes = document.notes as NoteType[];

  const html = `A chance for the Prime Minister and his Deputy to portray themselves as the "<b>action men</b>" of British politics.  
  Within a month-and-a-half, <a href="https://en.wikipedia.org/wiki/George_Osborne">George Osborne</a>, the country's new 38 year-old Chancellor of the Exchequor (i.e. the country's Finance Minister) 
  will present a budget to Parliament that calls for emergency actions to reduce Britain's forecast $280 billion deficit.`;

  export const meta = {
    title: "Components / Documents / Note",
    component: Note,
    parameters: { layout: "centered" },
  };
</script>

<script lang="ts">
  setContext("document", document);
</script>

<Story name="default">
  <Note focused note={notes[0]} />
</Story>

<Story name="editable">
  <Note focused note={{ ...notes[1], edit_access: true }} />
</Story>

<Story name="private access">
  <Note focused note={{ ...notes[1], access: "private" }} />
</Story>

<Story name="collaborators access">
  <Note focused note={{ ...notes[1], access: "organization" }} />
</Story>

<Story name="note with HTML">
  <Note focused note={{ ...notes[2], content: html }} />
</Story>
