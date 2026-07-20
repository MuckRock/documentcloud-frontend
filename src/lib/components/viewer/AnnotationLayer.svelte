<!-- @component
A box to draw notes in, similar to RedactionLayer.
This adds a layer to PDFPage and handles interactions.

This layer needs to coordinate between note coordinates 
and instances of the EditNote form.

Only one note can be added/edited at a time.

Must be a child of a ViewerContext
-->
<script lang="ts">
  import type { BBox, Maybe, Note as NoteType, Nullable } from "$lib/api/types";

  import { invalidate, goto } from "$app/navigation";

  import { fly } from "svelte/transition";
  import { _ } from "svelte-i18n";

  import Note from "../notes/Note.svelte";
  import EditNote from "../forms/EditNote.svelte";
  import NoteTab from "./NoteTab.svelte";

  import { width, height, isPageLevel, noteHashUrl } from "$lib/api/notes";
  import { getViewerState } from "$lib/state/viewer.svelte";
  import { getNotes, getViewerHref } from "$lib/utils/viewer";
  import Tooltip from "../common/Tooltip.svelte";

  interface Props {
    scale?: number;
    page_number: number; // zero-indexed
  }

  let { scale = 1.5, page_number }: Props = $props();

  const viewer = getViewerState();

  let drawStart: Nullable<[x: number, y: number]> = null;
  let drawing = $state(false);

  let document = $derived(viewer.document!);
  let notes = $derived(
    getNotes(document)[page_number]?.filter((note) => !isPageLevel(note)) ?? [],
  );
  let writing = $derived(viewer.mode === "annotating");
  let activeNote = $derived(
    Boolean(viewer.currentNote) || (Boolean(viewer.newNote) && !drawing),
  );

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
    if (e.target !== e.currentTarget) return;
    closeNote();

    drawing = true;
    viewer.currentNote = null;
    viewer.newNote = null;
    const [x, y] = getLayerPosition(e);
    drawStart = [x, y];
    // when starting, the note is a 0px shape
    viewer.newNote = {
      x1: x,
      x2: x,
      y1: y,
      y2: y,
      page_number,
    };
  }

  function continueDrawingBox(e: PointerEvent) {
    if (e.target !== e.currentTarget) return;
    if (!drawing || !drawStart || !viewer.newNote) return;

    const [x, y] = getLayerPosition(e);
    const [startX, startY] = drawStart;

    const movingRight = x > startX;
    const movingDown = y > startY;

    const x1 = movingRight ? startX : x;
    const x2 = movingRight ? x : startX;
    const y1 = movingDown ? startY : y;
    const y2 = movingDown ? y : startY;

    viewer.newNote = {
      x1,
      x2,
      y1,
      y2,
      page_number,
    };
  }

  function finishDrawingBox(e: PointerEvent) {
    if (e.target !== e.currentTarget) return;
    if (!drawing || !viewer.newNote) return;

    viewer.newNote = {
      ...viewer.newNote,
      // now initialize some note values
      page_number,
      title: "",
      content: "",
      access: "private",
    };

    drawStart = null;
    drawing = false;
  }

  function positionNote(note: BBox, offset: number) {
    const isLastPage = page_number + 1 === document.page_count;
    if (isLastPage && note.y2 > 0.5) {
      return `bottom: calc(calc(100% - ${note.y1 * 100}%) + ${offset}rem);`;
    } else {
      return `top: calc(${note.y2 * 100}% + ${offset}rem);`;
    }
  }

  function openNote(e: MouseEvent, note: NoteType) {
    const target = e.target as HTMLAnchorElement;
    const href =
      target?.href ||
      getViewerHref({ document, note, mode: viewer.mode, embed: viewer.embed });
    viewer.currentNote = note;
    viewer.newNote = null;
    goto(href);
  }

  function closeNote() {
    drawing = false;
    viewer.newNote = null;
    viewer.currentNote = null;
    const href = getViewerHref({
      document,
      mode: viewer.mode,
      embed: viewer.embed,
    });
    goto(href);
  }

  function onkeypress(e: KeyboardEvent) {
    if (e.key === "Escape") {
      closeNote();
    }
  }

  function onEditNoteSuccess(
    note: Maybe<Nullable<NoteType>>,
    oldNote: Maybe<Nullable<NoteType>>,
  ) {
    const editedNote = note;
    // Make an optimistic update to the `$documentStore`,
    // which should be overwritten by invalidation.
    // Start by removing the old note from the notes array.
    const newDocNotes = document.notes?.filter(
      (note) => note.id !== oldNote?.id,
    );
    // When a note is added or edited, add or replace it in the array.
    // When it's deleted, `editedNote` will be undefined so we'll skip this.
    if (editedNote) newDocNotes?.push(editedNote);
    // Make an optimistic update to `viewer.document` for `document.notes`.
    viewer.document = { ...document, notes: newDocNotes };
    // Finally, invalidate the document. After it's refetched,
    // viewer.document will be updated with fresh data from the API.
    invalidate(`document:${document.id}`);
  }
</script>

<svelte:window onkeydown={onkeypress} />

<div
  class="notes"
  class:writing
  class:drawing
  class:activeNote
  role="application"
  onpointerdown={startDrawingBox}
  onpointermove={continueDrawingBox}
  onpointerup={finishDrawingBox}
>
  {#each notes as note (note.id)}
    <a
      id={getNoteId(note)}
      class="note-tab"
      href={getViewerHref({
        document,
        note,
        mode: viewer.mode,
        embed: viewer.embed,
      })}
      title={note.title}
      style:top="calc({note.y1} * 100%)"
      onclick={(e) => openNote(e, note)}
    >
      <Tooltip caption={note.title}><NoteTab access={note.access} /></Tooltip>
    </a>
    <a
      href={getViewerHref({
        document,
        note,
        mode: viewer.mode,
        embed: viewer.embed,
      })}
      class="note-highlight {note.access}"
      class:active={viewer.currentNote?.id === note.id}
      title={note.title}
      style:top="{note.y1 * 100}%"
      style:left="{note.x1 * 100}%"
      style:width="{width(note) * 100}%"
      style:height="{height(note) * 100}%"
      onclick={(e) => openNote(e, note)}
    >
      {note.title}
    </a>
  {/each}

  {#if viewer.currentNote && !Boolean(viewer.newNote) && viewer.currentNote.page_number === page_number}
    <div
      class="note card"
      style={positionNote(viewer.currentNote, 1.5)}
      transition:fly={{ duration: 250, y: "-1.1rem" }}
    >
      {#if writing}
        <EditNote
          note={viewer.currentNote}
          {document}
          {page_number}
          onclose={closeNote}
          onsuccess={(note) => onEditNoteSuccess(note, viewer.currentNote)}
        />
      {:else}
        {#key viewer.currentNote.id}
          <Note
            note={viewer.currentNote}
            showExcerpt={false}
            {scale}
            onclose={closeNote}
          />
        {/key}
      {/if}
    </div>
  {/if}

  {#if viewer.newNote && viewer.newNote.page_number === page_number}
    <div
      class="box {viewer.newNote.access}"
      style:top="{viewer.newNote.y1 * 100}%"
      style:left="{viewer.newNote.x1 * 100}%"
      style:width="{width(viewer.newNote) * 100}%"
      style:height="{height(viewer.newNote) * 100}%"
    ></div>

    {#if !drawing}
      <div
        class="note card"
        style={positionNote(viewer.newNote, 1.5)}
        transition:fly={{ duration: 250, y: "-1.1rem" }}
      >
        <EditNote
          {document}
          note={viewer.newNote}
          onclose={closeNote}
          onsuccess={(note) => onEditNoteSuccess(note, undefined)}
        />
      </div>
    {/if}
  {/if}
</div>

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

  .note {
    position: absolute;
    left: -1.5rem;
    width: 44rem;
    max-width: 100%;
    z-index: var(--z-note);
    background: var(--white);
    border: 1px solid var(--gray-2);
    box-shadow: var(--shadow-2);
  }

  .card {
    padding: 1rem;
  }

  .box {
    position: absolute;
    border: 4px solid transparent;
    border-color: color-mix(in srgb, var(--note-private), var(--gray-4));
    background: var(--note-private);
    opacity: 0.75;
    mix-blend-mode: multiply;
    pointer-events: stroke;
    padding: 0.5rem;
    border-radius: 0.125rem;

    /* if we make boxes editable
    cursor: grab;
    resize: both;
    overflow: hidden;
    */
  }

  .box.public {
    border-color: color-mix(in srgb, var(--note-public), var(--gray-4));
    background: var(--note-public);
  }

  .box.organization {
    border-color: color-mix(in srgb, var(--note-org), var(--gray-4));
    background: var(--note-org);
  }

  .box.private {
    border-color: color-mix(in srgb, var(--note-private), var(--gray-4));
    background: var(--note-private);
  }

  a.note-highlight {
    border: 4px solid transparent;
    border-radius: 0.125rem;
    color: transparent;
    position: absolute;
    opacity: 0.5;
    pointer-events: all;
    mix-blend-mode: multiply;
    pointer-events: none;
  }

  a.note-highlight.public {
    background-color: var(--note-public);
    &.active {
      border-color: color-mix(in srgb, var(--yellow-3), var(--gray-4));
    }
  }

  a.note-highlight.private {
    background-color: var(--note-private);
    &.active {
      border-color: color-mix(in srgb, var(--note-private), var(--gray-4));
    }
  }

  a.note-highlight.organization {
    background-color: var(--note-org);
    &.active {
      border-color: color-mix(in srgb, var(--note-org), var(--gray-4));
    }
  }
</style>
