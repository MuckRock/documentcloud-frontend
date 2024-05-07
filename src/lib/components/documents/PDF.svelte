<!--
  @component
  PDF.svelte is a rendered PDF document (which we're not calling "Document" to avoid naming collisions).
  It uses PDF.js to render the actual pages on canvas elements.

  This is only the pages of the document, contained inside the larger viewer.
-->

<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { onMount } from "svelte";

  import * as pdfjs from "pdfjs-dist/build/pdf.mjs";
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url,
  ).href;

  import PdfPage from "./PDFPage.svelte";

  import { pageSizesFromSpec } from "@/api/pageSize.js";

  export let asset_url: URL = null;
  export let document: Document;
  export let scale: number | "width" | "height" = 1;
  export let pdf = null;

  let task: ReturnType<typeof pdfjs.getDocument> | undefined = null;

  $: sizes = pageSizesFromSpec(document.page_spec);

  onMount(async () => {
    if (!pdf) {
      task = pdfjs.getDocument({ url: asset_url });
      pdf = await task.promise;
    }
  });
</script>

<div class="pages">
  {#if pdf}
    {#each sizes as aspect, n}
      <PdfPage {aspect} page_number={n + 1} {pdf} {scale} />
    {/each}
  {/if}
</div>

<style>
  .pages {
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    gap: 3rem;
    width: 100%;
  }
</style>
