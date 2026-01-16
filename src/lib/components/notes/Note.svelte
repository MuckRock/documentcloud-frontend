<!--
  @component
  A single note, either overlaid on a document or on its own.

  It can use *either* a loaded PDF or a document image to render
  a document excerpt.

  Assumes it's a child of a ViewerContext

  To improve:

  - https://github.com/MuckRock/documentcloud-frontend/issues/1137

  To add:

  - https://github.com/MuckRock/documentcloud-frontend/issues/617

-->
<script lang="ts">
  import type { Note } from "$lib/api/types";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";
  import { XCircle16 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Portal from "../layouts/Portal.svelte";
  import Modal from "../layouts/Modal.svelte";
  import Share from "../documents/Share.svelte";

  import { width, height, isPageLevel } from "$lib/api/notes";
  import {
    getCurrentMode,
    getDocument,
    isEmbedded,
  } from "$lib/components/viewer/ViewerContext.svelte";
  import NoteContent from "./NoteContent.svelte";
  import NoteExcerpt from "./NoteExcerpt.svelte";
  import NoteActions from "./NoteActions.svelte";
  import NoteTitle from "./NoteTitle.svelte";
  import NoteMetadata from "./NoteMetadata.svelte";

  const embed = isEmbedded();
  const mode = getCurrentMode();

  const dispatch = createEventDispatcher();

  export let document = getDocument();
  export let note: Note;
  export let scale = 2;
  export let showExcerpt = true;

  // We may want to move the share modal into
  // the viewer, then set its visibility through context.
  let shareNoteOpen = false;

  $: doc = $document;
  $: page_level = isPageLevel(note);
  $: canEdit = note.edit_access && !embed;
  $: canShare = !embed;
  $: canClose = !embed && !page_level && $mode === "document";

  function closeNote() {
    dispatch("close");
  }
</script>

<div
  class="note {note.access} {$mode || 'notes'}"
  class:page_level
  style:--x1={note.x1}
  style:--x2={note.x2}
  style:--y1={note.y1}
  style:--y2={note.y2}
  style:--note-width={width(note)}
  style:--note-height={height(note)}
>
  <header>
    <NoteTitle {doc} {note} {embed} />
    {#if canClose}
      <Button minW={false} ghost on:click={closeNote}>
        <XCircle16 />
      </Button>
    {/if}
  </header>
  {#if !page_level && showExcerpt}
    <NoteExcerpt document={doc} {note} {scale} />
  {/if}
  <NoteContent {note} />
  {#if !embed}
    <footer>
      <NoteActions
        {doc}
        {note}
        {canEdit}
        {canShare}
        onShare={() => (shareNoteOpen = true)}
      />
      <NoteMetadata {note} />
    </footer>
  {/if}
</div>
{#if !embed && shareNoteOpen}
  <Portal>
    <Modal
      on:close={() => (shareNoteOpen = false)}
      fillViewport
      maxWidth="66rem"
      maxHeight="80vh"
    >
      <h1 slot="title">{$_("dialog.share")}</h1>
      <Share document={doc} note_id={note.id} currentTab="note" />
    </Modal>
  </Portal>
{/if}

<style>
  .note {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    pointer-events: all;
    position: relative;
    scroll-margin-top: 6rem;
    z-index: var(--z-note);
  }

  /* page-level */
  .note.page_level {
    background-color: var(--white, white);
    border: 1px solid var(--gray-2);
    box-shadow: var(--shadow-3);
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    position: relative;
    width: 100%;
    z-index: inherit;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
    gap: 0.5rem;
  }

  .note-actions {
    display: flex;
    gap: 0.25rem;
  }

  footer {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
  }
</style>
