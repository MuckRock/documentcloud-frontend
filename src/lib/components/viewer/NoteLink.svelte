<!-- @component
A link to a note, overlaid on a document
-->
<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Note } from "$lib/api/types";

  import { pushState } from "$app/navigation";
  import { getContext } from "svelte";
  import { noteHashUrl, width, height } from "$lib/api/notes";

  export let note: Note;

  const activeNote: Writable<Note> = getContext("activeNote");

  $: href = noteHashUrl(note);

  function onClick(e) {
    activeNote?.set(note);
    pushState(e.target.href, {});
  }
</script>

<a
  {href}
  class="note {note.access}"
  title={note.title}
  style:top="{note.y1 * 100}%"
  style:left="{note.x1 * 100}%"
  style:width="{width(note) * 100}%"
  style:height="{height(note) * 100}%"
  on:click={onClick}
>
  {note.title}
</a>

<style>
  a.note {
    border-radius: 0.25rem;
    color: transparent;
    position: absolute;
    opacity: 0.5;
    pointer-events: all;
    mix-blend-mode: multiply;
  }

  a.note.public {
    background-color: var(--note-public);
  }

  a.note.private {
    background-color: var(--note-private);
    border-color: var(--note-private);
  }

  a.note.organization {
    background-color: var(--note-org);
    border-color: var(--note-org);
  }
</style>
