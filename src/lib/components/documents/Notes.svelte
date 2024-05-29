<script lang="ts">
  import type { Note as NoteType } from "$lib/api/types";

  // worker is configured in +layout.svelte
  import * as pdfjs from "pdfjs-dist/build/pdf.mjs";
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.mjs",
      import.meta.url,
    ).href;
  }
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";

  import Note from "./Note.svelte";

  import { noteHashUrl } from "$lib/api/notes";

  export let notes: NoteType[];
  export let pdf = new Promise(() => {});
  export let task: ReturnType<typeof pdfjs.getDocument> | undefined = null;
  export let asset_url: URL = undefined;

  onMount(async () => {
    if (asset_url && !task) {
      task = pdfjs.getDocument({ url: asset_url });
      pdf = task.promise;
    }
  });
</script>

<div class="pages">
  {#if asset_url}
    {#await pdf then pdf}
      {#each notes as note}
        <div class="note-wrapper">
          <Note {note} focused {pdf} />
          <h4>
            <a href={noteHashUrl(note)}>
              {$_("documents.pageAbbrev")}
              {note.page_number + 1}
            </a>
          </h4>
        </div>
      {/each}
    {/await}
  {:else}
    {#each notes as note}
      <div class="note-wrapper">
        <Note {note} focused />
        <h4>
          <a href={noteHashUrl(note)}>
            {$_("documents.pageAbbrev")}
            {note.page_number + 1}
          </a>
        </h4>
      </div>
    {/each}
  {/if}
</div>

<style>
  .pages {
    display: flex;
    flex-flow: column;
    align-items: center;
    gap: 3rem;
    max-width: 38.0625rem;
  }

  .note-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  h4,
  h4 a {
    color: var(--gray-4, #5c717c);
    text-decoration: none;
    font-weight: var(--font-regular);
  }

  h4 a:hover {
    text-decoration: underline;
  }
</style>
