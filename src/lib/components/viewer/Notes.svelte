<!-- @component
Assumes it's a child of a ViewerContext
 -->

<script lang="ts">
  import { _ } from "svelte-i18n";
  import { ListOrdered24 } from "svelte-octicons";

  import Empty from "../common/Empty.svelte";
  import Note from "./Note.svelte";

  import { getViewerHref } from "$lib/utils/viewer";
  import {
    getDocument,
    isEmbedded,
  } from "$lib/components/viewer/ViewerContext.svelte";

  const documentStore = getDocument();
  const embed = isEmbedded();

  $: document = $documentStore;
  $: notes = document.notes;
  $: annotate = getViewerHref({ document, mode: "annotating" });
</script>

<div class="pages">
  {#each notes as note}
    <div class="note-wrapper">
      <header>
        <a class="pageNumber" href={getViewerHref({ document, note, embed })}>
          {$_("documents.page")}
          {note.page_number + 1}
        </a>
      </header>
      <div class="card"><Note {note} /></div>
    </div>
  {:else}
    <Empty icon={ListOrdered24}>
      <h2>{$_("notes.empty")}</h2>
      {#if document.edit_access}
        <p>
          <a href={annotate}> {$_("notes.cta")}</a>
        </p>
      {/if}
    </Empty>
  {/each}
</div>

<style>
  .pages {
    display: flex;
    flex-flow: column;
    align-items: center;
    gap: 2rem;
    margin: 0 auto;
    max-width: 38.0625rem;
    padding: 2rem 0;
  }

  .card {
    border: 1px solid var(--gray-2);
    box-shadow: var(--shadow-2);
  }

  .note-wrapper {
    display: flex;
    flex-direction: column;
  }

  header {
    display: flex;
    padding: 0.5rem;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
  }

  a.pageNumber {
    flex: 0 0 auto;
    color: var(--gray-4, #5c717c);
    font-size: var(--font-sm);
    font-weight: var(--font-regular);
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
</style>
