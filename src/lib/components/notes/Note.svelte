<!--
  @component
  A single note, either overlaid on a document or on its own.

  It can use *either* a loaded PDF or a document image to render
  a document excerpt.

  Must be a child of a ViewerContext

  To improve:

  - https://github.com/MuckRock/documentcloud-frontend/issues/1137

  To add:

  - https://github.com/MuckRock/documentcloud-frontend/issues/617

-->
<script lang="ts">
  import type { Document, Note } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { XCircle16 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Portal from "../layouts/Portal.svelte";
  import Modal from "../layouts/Modal.svelte";
  import Share from "../forms/Share.svelte";

  import { width, height, isPageLevel } from "$lib/api/notes";
  import { getViewerState } from "$lib/state/viewer.svelte";
  import NoteContent from "./NoteContent.svelte";
  import NoteExcerpt from "./NoteExcerpt.svelte";
  import NoteActions from "./NoteActions.svelte";
  import NoteTitle from "./NoteTitle.svelte";
  import NoteMetadata from "./NoteMetadata.svelte";

  const viewer = getViewerState();

  interface Props {
    document?: Document;
    note: Note;
    scale?: number;
    showExcerpt?: boolean;
    onclose?: () => void;
  }

  let {
    document,
    note,
    scale = 2,
    showExcerpt = true,
    onclose,
  }: Props = $props();

  // We may want to move the share modal into
  // the viewer, then set its visibility through context.
  let shareNoteOpen = $state(false);

  let doc = $derived(document ?? viewer.document!);
  let page_level = $derived(isPageLevel(note));
  let canEdit = $derived(note.edit_access && !viewer.embed);
  let canShare = $derived(!viewer.embed);
  let canClose = $derived(
    !viewer.embed && !page_level && viewer.mode === "document",
  );
</script>

<div
  class="note {note.access} {viewer.mode || 'notes'}"
  class:page_level
  style:--x1={note.x1}
  style:--x2={note.x2}
  style:--y1={note.y1}
  style:--y2={note.y2}
  style:--note-width={width(note)}
  style:--note-height={height(note)}
>
  <header>
    <NoteTitle {doc} {note} embed={viewer.embed} />
    {#if canClose}
      <Button minW={false} ghost onclick={() => onclose?.()}>
        <XCircle16 />
      </Button>
    {/if}
  </header>
  {#if !page_level && showExcerpt}
    <NoteExcerpt document={doc} {note} {scale} />
  {/if}
  <NoteContent {note} />
  {#if !viewer.embed}
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
{#if !viewer.embed && shareNoteOpen}
  <Portal>
    <Modal onclose={() => (shareNoteOpen = false)}>
      {#snippet title()}
        <h1>{$_("dialog.share")}</h1>
      {/snippet}
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
