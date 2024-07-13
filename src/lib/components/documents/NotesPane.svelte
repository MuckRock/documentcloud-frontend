<!-- @component
Display notes on a document. This is the read-only version.
To create or edit notes, see `AnnotationPane.svelte`.
-->
<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Note as NoteType } from "$lib/api/types";

  import { pushState } from "$app/navigation";

  import { getContext } from "svelte";
  import { XCircleFill16 } from "svelte-octicons";

  import Note from "./Note.svelte";
  import NoteLink from "./NoteLink.svelte";
  import NoteTab from "./NoteTab.svelte";

  import { noteHashUrl } from "$lib/api/notes";

  export let notes: NoteType[] = [];
  export let pdf = null; // PDFDocumentProxy
  export let scale = 1.5;

  const activeNote: Writable<NoteType> = getContext("activeNote");

  function openNote(e, note: NoteType) {
    activeNote?.set(note);
    const href = e.target?.href || noteHashUrl(note);
    pushState(href, {});
  }

  function closeNote() {
    activeNote?.set(null);
    pushState(window.location.pathname, {});
  }
</script>

<div class="notes">
  {#each notes as note}
    {@const is_active = note.id === $activeNote?.id}
    <a
      class="note"
      href={noteHashUrl(note)}
      title={note.title}
      style:top="{note.y1 * 100}%"
      on:click={(e) => openNote(e, note)}
    >
      <NoteTab access={note.access} />
      {#if is_active}
        <button
          class="close"
          on:click|preventDefault|stopPropagation={closeNote}
        >
          <XCircleFill16 />
        </button>
      {/if}
    </a>
    {#if is_active}
      <Note {note} {pdf} {scale} />
    {:else}
      <NoteLink {note} />
    {/if}
  {/each}
</div>

<style>
  .notes {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    pointer-events: none;
  }

  .notes :global(*) {
    pointer-events: all;
  }

  .note {
    position: absolute;
    pointer-events: all;
    left: -3rem;
  }

  .note button {
    border: none;
    padding: 0;
    background: none;
    cursor: pointer;

    position: absolute;
    margin: auto 0;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;

    display: flex;
    padding-left: 0.5rem;
    justify-content: left;
    align-items: center;
  }
</style>
