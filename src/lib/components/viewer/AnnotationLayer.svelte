<!-- @component
A box to draw notes in, similar to RedactionLayer.
This adds a layer to PDFPage and handles interactions.

This layer needs to coordinate between note coordinates 
and instances of the EditNote form.

Only one note can be added/edited at a time.

Assumes it's a child of a ViewerContext
-->
<script lang="ts">
  import type { BBox, Document, Note as NoteType } from "$lib/api/types";

  import { pushState } from "$app/navigation";

  import { _ } from "svelte-i18n";
  import { XCircleFill16 } from "svelte-octicons";

  import EditNote from "../forms/EditNote.svelte";
  import NoteTab from "./NoteTab.svelte";

  import Modal from "../layouts/Modal.svelte";
  import Portal from "../layouts/Portal.svelte";

  import { noteHashUrl, width, height, isPageLevel } from "$lib/api/notes";
  import {
    getActiveNote,
    getCurrentMode,
    getDocument,
    getPDF,
    isEmbedded,
  } from "$lib/components/viewer/ViewerContext.svelte";
  import { getViewerHref } from "$lib/utils/viewer";
  import Note from "./Note.svelte";

  export let scale = 1.5;

  const document = getDocument();
  const pdf = getPDF();
  const embed = isEmbedded();
  const mode = getCurrentMode();
  const activeNote = getActiveNote();

  export let notes: NoteType[] = [];
  export let page_number: number; // zero-indexed

  let container: HTMLElement;
  let newNote: Partial<NoteType> & BBox = null; // is this too clever?

  let dragging = false;
  let form: EditNote;

  $: writing = $mode === "annotating";
  $: editing = Boolean($activeNote) || (Boolean(newNote) && !dragging);
  $: edit_page_note =
    Boolean($activeNote) &&
    isPageLevel($activeNote) &&
    $activeNote.page_number === page_number;

  function pointerdown(e: PointerEvent) {
    if ($activeNote || newNote) return;

    dragging = true;

    const { offsetX, offsetY } = e;
    const { clientWidth, clientHeight } = e.target as HTMLDivElement;

    newNote = {
      x1: offsetX / clientWidth,
      x2: offsetX / clientWidth,
      y1: offsetY / clientHeight,
      y2: offsetY / clientHeight,
    };
  }

  function pointermove(e: PointerEvent) {
    if (!dragging) return;

    const { offsetX, offsetY } = e;
    const { clientWidth, clientHeight } = e.target as HTMLDivElement;

    let x1: number, x2: number, y1: number, y2: number;
    let x = offsetX / clientWidth;
    let y = offsetY / clientHeight;

    if (x > newNote.x1) {
      // moving right
      x1 = newNote.x1;
      x2 = x;
    } else {
      // moving left
      x1 = x;
      x2 = newNote.x2;
    }

    if (y > newNote.y1) {
      y1 = newNote.y1;
      y2 = y;
    } else {
      y1 = y;
      y2 = newNote.y2;
    }

    newNote = {
      x1,
      x2,
      y1,
      y2,
    };
  }

  function pointerup(e: PointerEvent) {
    dragging = false;

    if (!newNote || editing) return;

    const { offsetX, offsetY } = e;
    const { clientWidth, clientHeight } = e.target as HTMLDivElement;

    const x = offsetX / clientWidth;
    const y = offsetY / clientHeight;

    newNote = {
      page_number,
      x1: Math.min(newNote.x1, x),
      x2: Math.max(newNote.x2, x),
      y1: Math.min(newNote.y1, y),
      y2: Math.max(newNote.y2, y),

      title: "",
      content: "",
      access: "private",
    };
  }

  function openNote(e, note: NoteType) {
    activeNote?.set(note);
    const href =
      e.target?.href || getViewerHref({ document, note, mode: $mode, embed });
    pushState(href, {});
  }

  function closeNote() {
    activeNote?.set(null);
    newNote = null;
    dragging = false;
    pushState(window.location.pathname, {});
  }

  function onkeypress(e: KeyboardEvent) {
    if (e.key === "Escape") {
      closeNote();
    }
  }
</script>

<svelte:window on:keydown={onkeypress} />

<div
  bind:this={container}
  class="notes"
  class:writing
  class:dragging
  class:editing
  on:pointerdown|self={pointerdown}
  on:pointermove|self={pointermove}
  on:pointerup|self={pointerup}
>
  {#each notes || [] as note}
    {@const is_active = note.id === $activeNote?.id}
    <a
      class="note"
      href={getViewerHref({ document, note, mode: $mode, embed })}
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
      <div
        class="box {note.access}"
        style:top="{note.y1 * 100}%"
        style:left="{note.x1 * 100}%"
        style:width="{width(note) * 100}%"
        style:height="{height(note) * 100}%"
      ></div>
      {#if writing}
        <div class="note-form" style:top="calc({note.y2} * 100% + 1rem)">
          <EditNote
            bind:this={form}
            {document}
            bind:note
            {page_number}
            on:close={closeNote}
          />
        </div>
      {:else}
        <Note {note} {scale} />
      {/if}
    {:else}
      <a
        href={noteHashUrl(note)}
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

    {#if !dragging}
      <div class="note-form" style:top="calc({newNote.y2} * 100% + 1rem)">
        <EditNote
          bind:this={form}
          {document}
          bind:note={newNote}
          {page_number}
          on:close={closeNote}
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
        note={$activeNote}
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
  }

  .notes :global(*) {
    pointer-events: all;
  }

  .notes.dragging :global(*) {
    pointer-events: none;
  }

  .note {
    transform: translateY(-25%);
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

  .note-form {
    position: absolute;
    pointer-events: all;
    width: 100%;
    z-index: 10;
  }

  .notes.editing {
    cursor: auto;
    pointer-events: none;
  }

  .box {
    position: absolute;
    border: 2px dashed var(--gray-4);
    padding: 0.5rem;
    border-radius: 0.25rem;
    background-color: transparent;
    /* if we make boxes editable
    cursor: grab;
    resize: both;
    overflow: hidden;
    */
  }

  .box.public {
    border-color: var(--note-public);
  }

  .box.organization {
    border-color: var(--note-org);
  }

  .box.private {
    border-color: var(--note-private);
  }

  a.note-highlight {
    border-radius: 0.25rem;
    color: transparent;
    position: absolute;
    opacity: 0.5;
    pointer-events: all;
    mix-blend-mode: multiply;
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
