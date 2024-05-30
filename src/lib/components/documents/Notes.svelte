<script lang="ts">
  import type { Document } from "$lib/api/types";

  // worker is configured in +layout.svelte
  import * as pdfjs from "pdfjs-dist/build/pdf.mjs";
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.mjs",
      import.meta.url,
    ).href;
  }
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import { ListOrdered24 } from "svelte-octicons";

  import Empty from "../common/Empty.svelte";
  import Note from "./Note.svelte";

  import { noteUrl } from "$lib/api/notes";
  import { canonicalUrl } from "$lib/api/documents";

  export let document: Document;
  export let pdf = new Promise(() => {});
  export let task: ReturnType<typeof pdfjs.getDocument> | undefined = null;
  export let asset_url: URL = undefined;

  $: notes = document.notes;
  $: annotate = new URL("annotate/", canonicalUrl(document)).href;

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
            <a href={noteUrl(document, note).href}>
              {$_("documents.page")}
              {note.page_number + 1}
            </a>
          </h4>
        </div>
      {:else}
        <Empty icon={ListOrdered24}>
          <h2>{$_("notes.empty")}</h2>
          <p>
            <a href={annotate}> {$_("notes.cta")}</a>
          </p>
        </Empty>
      {/each}
    {/await}
  {:else}
    {#each notes as note}
      <div class="note-wrapper">
        <Note {note} focused />
        <h4>
          <a href={noteUrl(document, note).href}>
            {$_("documents.page")}
            {note.page_number + 1}
          </a>
        </h4>
      </div>
    {:else}
      <Empty icon={ListOrdered24}>
        <h2>{$_("notes.empty")}</h2>
        <p>
          <a href={annotate}> {$_("notes.cta")}</a>
        </p>
      </Empty>
    {/each}
  {/if}
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
