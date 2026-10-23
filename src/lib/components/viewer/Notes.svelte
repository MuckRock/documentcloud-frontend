<!-- @component
Must be a child of a ViewerContext
 -->

<script lang="ts">
  import { _ } from "svelte-i18n";
  import { ListOrdered24 } from "svelte-octicons";

  import Empty from "../common/Empty.svelte";
  import Note from "../notes/Note.svelte";
  import Virtualizer from "$lib/components/viewer/Virtualizer.svelte";

  import { getViewerHref } from "$lib/utils/viewer";
  import { getViewerState } from "$lib/state/viewer.svelte";

  const viewer = getViewerState();

  let document = $derived(viewer.document!);
  let notes = $derived(viewer.notes);
  let annotate = $derived(getViewerHref({ document, mode: "annotating" }));
</script>

<div class="pages" bind:this={viewer.innerContainer}>
  {#if notes.length > 0}
    <Virtualizer data={notes} getKey={({ id }) => id}>
      {#snippet children(note, i)}
        <div class="note-wrapper">
          <div class="card">
            <Note {note} />
          </div>
        </div>
      {/snippet}
    </Virtualizer>
  {:else}
    <Empty icon={ListOrdered24}>
      <h2>{$_("notes.empty")}</h2>
      {#if document.edit_access}
        <p>
          <a href={annotate}> {$_("notes.cta")}</a>
        </p>
      {/if}
    </Empty>
  {/if}
</div>

<style>
  .pages {
    width: 100%;
    margin: 0 auto;
    max-width: 38.0625rem;
    padding: 2rem 0 0;
  }

  .card {
    border: 1px solid var(--gray-2);
    box-shadow: var(--shadow-2);
  }

  .note-wrapper {
    display: flex;
    flex-direction: column;
    margin-bottom: 2rem;
  }
</style>
