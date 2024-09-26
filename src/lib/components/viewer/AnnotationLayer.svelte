<!-- @component
A box to draw notes in, similar to RedactionLayer.
This adds a layer to PDFPage and handles interactions.

This layer needs to coordinate between note coordinates 
and instances of the EditNote form.

Only one note can be added/edited at a time.
-->
<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { BBox, Document, Note as NoteType } from "$lib/api/types";

  import { pushState } from "$app/navigation";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { XCircleFill16 } from "svelte-octicons";

  import EditNote from "../forms/EditNote.svelte";
  import NoteLink from "./NoteLink.svelte";
  import NoteTab from "./NoteTab.svelte";

  import Modal from "../layouts/Modal.svelte";
  import Portal from "../layouts/Portal.svelte";

  import { noteHashUrl, width, height, isPageLevel } from "$lib/api/notes";

  export let document: Document;
  export let notes: NoteType[] = [];

  export let page_number: number; // zero-indexed

  const activeNote: Writable<Partial<NoteType>> = getContext("activeNote");
  let container: HTMLElement;
  let newNote: Partial<NoteType> & BBox = null; // is this too clever?

  let dragging = false;
  let form: EditNote;

  $: editing = Boolean($activeNote) || (Boolean(newNote) && !dragging);
  $: edit_page_note =
    Boolean($activeNote) &&
    isPageLevel($activeNote) &&
    $activeNote.page_number === page_number;

  function pointerdown(e) {
    if ($activeNote || newNote) return;

    dragging = true;

    const { offsetX, offsetY } = e;
    const { clientWidth, clientHeight } = e.target;

    newNote = {
      x1: offsetX / clientWidth,
      x2: offsetX / clientWidth,
      y1: offsetY / clientHeight,
      y2: offsetY / clientHeight,
    };
  }

  function pointermove(e) {
    if (!dragging) return;

    const { offsetX, offsetY } = e;
    const { clientWidth, clientHeight } = e.target;

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

  function pointerup(e) {
    dragging = false;

    if (!newNote || editing) return;

    const { offsetX, offsetY } = e;
    const { clientWidth, clientHeight } = e.target;

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
    const href = e.target?.href || noteHashUrl(note);
    pushState(href, {});
  }

  function closeNote() {
    activeNote?.set(null);
    newNote = null;
    dragging = false;
    pushState(window.location.pathname, {});
  }

  function onkeypress(e) {
    if (e.key === "Escape") {
      closeNote();
    }
  }
</script>

<svelte:window on:keydown={onkeypress} />

<div
  bind:this={container}
  class="notes"
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
      <div
        class="box {note.access}"
        style:top="{note.y1 * 100}%"
        style:left="{note.x1 * 100}%"
        style:width="{width(note) * 100}%"
        style:height="{height(note) * 100}%"
      ></div>

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
      <NoteLink {note} />
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

    cursor: crosshair;
  }

  .notes :global(*) {
    pointer-events: all;
  }

  .notes.dragging :global(*) {
    pointer-events: none;
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
    border: 3px dashed var(--gray-4);
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
</style>
