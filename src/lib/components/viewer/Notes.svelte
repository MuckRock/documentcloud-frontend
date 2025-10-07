<!-- @component
Assumes it's a child of a ViewerContext
 -->

<script lang="ts">
  import { _ } from "svelte-i18n";
  import { ListOrdered24 } from "svelte-octicons";

  import Empty from "../common/Empty.svelte";
  import Note from "../notes/Note.svelte";

  import { getViewerHref } from "$lib/utils/viewer";
  import { getDocument } from "$lib/components/viewer/ViewerContext.svelte";

  const documentStore = getDocument();

  $: document = $documentStore;
  $: notes = document.notes ?? [];
  $: annotate = getViewerHref({ document, mode: "annotating" });
</script>

<div class="pages">
  {#each notes as note}
    <div class="note-wrapper">
      <div class="card">
        <Note {note} />
      </div>
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
    min-height: 100%;
  }

  .card {
    border: 1px solid var(--gray-2);
    box-shadow: var(--shadow-2);
  }

  .note-wrapper {
    display: flex;
    flex-direction: column;
  }
</style>
