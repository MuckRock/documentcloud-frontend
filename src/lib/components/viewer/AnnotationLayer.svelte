<!-- @component
A box to draw notes in, similar to RedactionLayer.
This adds a layer to PDFPage and handles interactions.

This layer needs to coordinate between note coordinates 
and instances of the EditNote form.

Only one note can be added/edited at a time.

Assumes it's a child of a ViewerContext
-->
<script lang="ts">
  import type { BBox, Note as NoteType, Nullable } from "$lib/api/types";

  import { invalidate, pushState } from "$app/navigation";

  import { _ } from "svelte-i18n";

  import EditNote from "../forms/EditNote.svelte";
  import NoteTab from "./NoteTab.svelte";

  import Modal from "../layouts/Modal.svelte";
  import Portal from "../layouts/Portal.svelte";

  import { width, height, isPageLevel, noteHashUrl } from "$lib/api/notes";
  import {
    getCurrentMode,
    getCurrentNote,
    getDocument,
    isEmbedded,
  } from "$lib/components/viewer/ViewerContext.svelte";
  import { getNotes, getViewerHref } from "$lib/utils/viewer";
  import Note from "./Note.svelte";
  import { fly } from "svelte/transition";

  export let scale = 1.5;
  export let page_number: number; // zero-indexed

  let document = getDocument();
  const embed = isEmbedded();
  const mode = getCurrentMode();
  const currentNote = getCurrentNote();

  let newNote: Nullable<Partial<NoteType> & BBox> = null;
  let drawing = false;

  $: notes =
    getNotes(document)[page_number]?.filter((note) => !isPageLevel(note)) ?? [];
  $: writing = $mode === "annotating";
  $: activeNote = Boolean($currentNote) || (Boolean(newNote) && !drawing);
  $: edit_page_note =
    writing &&
    Boolean($currentNote) &&
    isPageLevel($currentNote) &&
    page_number === $currentNote.page_number;

  function getNoteId(note: NoteType) {
    return noteHashUrl(note).split("#")[1];
  }

  function getLayerPosition(e: PointerEvent): [x: number, y: number] {
    // pointer position in window
    const { offsetX, offsetY } = e;
    // page dimensions
    const { clientWidth, clientHeight } = e.target as HTMLDivElement;
    // box points
    return [offsetX / clientWidth, offsetY / clientHeight];
  }

  function startDrawingBox(e: PointerEvent) {
    if ($currentNote || newNote) return;

    drawing = true;
    $currentNote = null;
    const [x, y] = getLayerPosition(e);

    // when starting, the note is a 0px shape
    newNote = {
      x1: x,
      x2: x,
      y1: y,
      y2: y,
    };
  }

  function continueDrawingBox(e: PointerEvent) {
    if (!drawing || !newNote) return;
    console.log("pointermove");

    const [x, y] = getLayerPosition(e);

    const movingRight = x > newNote.x1;
    const movingDown = y > newNote.y1;

    const x1 = movingRight ? newNote.x1 : x;
    const x2 = movingRight ? x : newNote.x2;
    const y1 = movingDown ? newNote.y1 : y;
    const y2 = movingDown ? y : newNote.y2;

    newNote = {
      x1,
      x2,
      y1,
      y2,
    };
  }

  function finishDrawingBox(e: PointerEvent) {
    if (!newNote || !drawing) return;

    const [x, y] = getLayerPosition(e);

    newNote = {
      x1: Math.min(newNote.x1, x),
      x2: Math.max(newNote.x2, x),
      y1: Math.min(newNote.y1, y),
      y2: Math.max(newNote.y2, y),
      // now initialize some note values
      page_number,
      title: "",
      content: "",
      access: "private",
    };

    drawing = false;
  }

  function openNote(e: MouseEvent, note: NoteType) {
    const target = e.target as HTMLAnchorElement;
    const href =
      target?.href || getViewerHref({ document, note, mode: $mode, embed });
    $currentNote = note;
    pushState(href, { note });
  }

  function closeNote() {
    drawing = false;
    newNote = null;
    $currentNote = null;
    const href = getViewerHref({ document, mode: $mode, embed });
    pushState(href, {});
  }

  function onkeypress(e: KeyboardEvent) {
    if (e.key === "Escape") {
      closeNote();
    }
  }

  function handleNewNoteSuccess(e: CustomEvent<NoteType>) {
    const note = e.detail;
    // invalidate the document
    invalidate(`document:${document.id}`);
  }
</script>

<svelte:window on:keydown={onkeypress} />

<div
  class="notes"
  class:writing
  class:drawing
  class:activeNote
  on:pointerdown|self={startDrawingBox}
  on:pointermove|self={continueDrawingBox}
  on:pointerup|self={finishDrawingBox}
>
  {#each notes as note (note.id)}
    <a
      id={getNoteId(note)}
      class="note-tab"
      href={getViewerHref({ document, note, mode: $mode, embed })}
      title={note.title}
      style:top="calc({note.y1} * 100%)"
      on:click={(e) => openNote(e, note)}
    >
      <NoteTab access={note.access} title={note.title} />
    </a>
    <a
      href={getViewerHref({ document, note, mode: $mode, embed })}
      class="note-highlight {note.access}"
      title={note.title}
      style:top="{note.y1 * 100}%"
      style:left="{note.x1 * 100}%"
      style:width="{width(note) * 100}%"
      style:height="{height(note) * 100}%"
      on:click={(e) => openNote(e, note)}
    >
      {note.title}
    </a>
    {#if note.id === $currentNote?.id}
      {#if writing}
        <div class="note-form" style:top="calc({note.y1} * 100% - 3.25rem)">
          <EditNote bind:note {document} {page_number} on:close={closeNote} />
        </div>
      {:else}
        <div class="note-reading" style:top="calc({note.y1} * 100% - 3.25rem)">
          <Note {note} {scale} on:close={closeNote} />
        </div>
      {/if}
    {/if}
  {/each}

  {#if newNote}
    <div
      class="box {newNote.access}"
      style:top="{newNote.y1 * 100}%"
      style:left="{newNote.x1 * 100}%"
      style:width="{width(newNote) * 100}%"
      style:height="{height(newNote) * 100}%"
    ></div>

    {#if !drawing}
      <div
        class="note-form"
        style:top="calc({newNote.y2} * 100% + 3rem)"
        transition:fly={{ duration: 250, y: "-1.1rem" }}
      >
        <EditNote
          {document}
          bind:note={newNote}
          on:close={closeNote}
          on:success={handleNewNoteSuccess}
        />
      </div>
    {/if}
  {/if}
</div>

{#if edit_page_note}
  <Portal>
    <Modal on:close={closeNote}>
      <h2 slot="title">
        {$_("annotate.cta.add-note")}
      </h2>

      <EditNote
        {document}
        note={$currentNote}
        {page_number}
        on:close={closeNote}
      />
    </Modal>
  </Portal>
{/if}

<style>
  .notes {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    pointer-events: none;
  }

  .notes.writing {
    cursor: crosshair;
    pointer-events: all;
  }

  .notes :global(*) {
    pointer-events: all;
  }

  .notes.drawing :global(*) {
    pointer-events: none;
  }

  .note-tab {
    left: -3rem;
    position: absolute;
    pointer-events: all;

    scroll-margin-top: 6rem;
  }

  .note-reading {
    position: absolute;
    left: -1.5rem;
    width: 44rem;
    max-width: 100%;
    z-index: var(--z-note);
  }

  .note-form {
    position: absolute;
    left: -1.5rem;
    width: 44rem;
    max-width: 100%;
    z-index: var(--z-note);
    pointer-events: all;
  }

  .notes.activeNote {
    cursor: auto;
    pointer-events: none;
  }

  .box {
    position: absolute;
    border: 0.5rem solid var(--note-private);
    background: var(--note-private);
    opacity: 0.75;
    mix-blend-mode: multiply;
    box-sizing: content-box;
    pointer-events: stroke;
    padding: 0.5rem;
    border-radius: 0.25rem;

    /* if we make boxes editable
    cursor: grab;
    resize: both;
    overflow: hidden;
    */
  }

  .box.public {
    border-color: var(--note-public);
    background: var(--note-public);
  }

  .box.organization {
    border-color: var(--note-org);
    background: var(--note-org);
  }

  .box.private {
    border-color: var(--note-private);
    background: var(--note-private);
  }

  a.note-highlight {
    border-radius: 0.25rem;
    color: transparent;
    position: absolute;
    opacity: 0.5;
    pointer-events: all;
    mix-blend-mode: multiply;

    border: 0.5rem solid var(--gray-4);
    pointer-events: none;
  }

  a.note-highlight.public {
    background-color: var(--note-public);
    border-color: var(--note-public);
  }

  a.note-highlight.private {
    background-color: var(--note-private);
    border-color: var(--note-private);
  }

  a.note-highlight.organization {
    background-color: var(--note-org);
    border-color: var(--note-org);
  }
</style>
