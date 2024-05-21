<!--
  @component
  A single note, either overlaid on a document or on its own.
  It has two states, focused and normal.


-->

<script lang="ts">
  import type { Note } from "$lib/api/types";

  import { noteHashUrl, width, height } from "$lib/api/notes";

  export let note: Note;
  export let focused = false;
</script>

{#if focused}
  <div class="note"></div>
{:else}
  <a
    href={noteHashUrl(note)}
    class="note {note.access}"
    title={note.title}
    style:top="{note.y1 * 100}%"
    style:left="{note.x1 * 100}%"
    style:width="{width(note) * 100}%"
    style:height="{height(note) * 100}%"
  >
    {note.title}
  </a>
{/if}

<style>
  a.note {
    color: transparent;
    position: absolute;
    border: 2px solid var(--note-public);
    background-color: var(--note-public);
    opacity: 0.33;
    pointer-events: all;
  }

  .note.private {
    border-color: var(--note-private);
  }

  .note.org {
    border-color: var(--note-org);
  }
</style>
