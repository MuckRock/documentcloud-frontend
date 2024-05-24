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

  import { onMount } from "svelte";

  import Note from "./Note.svelte";

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
        <Note {note} focused {pdf} />
      {/each}
    {/await}
  {:else}
    {#each notes as note}
      <Note {note} focused />
    {/each}
  {/if}
</div>

<style>
  .pages {
    display: flex;
    flex-flow: column;
    align-items: center;
    gap: 3rem;
  }
</style>
