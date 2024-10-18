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
      <Note {note} />
      <h4>
        <a href={getViewerHref({ document, note, embed })}>
          {$_("documents.page")}
          {note.page_number + 1}
        </a>
      </h4>
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
    gap: 3rem;
    margin: 0 auto;
    max-width: 38.0625rem;
  }

  .note-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  h4,
  h4 a {
    text-decoration: none;
    font-weight: var(--font-regular);
  }

  h4 a:hover {
    text-decoration: underline;
  }
</style>
