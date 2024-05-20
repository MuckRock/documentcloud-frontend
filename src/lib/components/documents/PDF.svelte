<!--
  @component
  PDF.svelte is a rendered PDF document (which we're not calling "Document" to avoid naming collisions).
  It uses PDF.js to render the actual pages on canvas elements.

  This is only the pages of the document, contained inside the larger viewer.
-->

<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { onMount } from "svelte";

  // worker is configured in +layout.svelte
  import * as pdfjs from "pdfjs-dist/build/pdf.mjs";
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.mjs",
      import.meta.url,
    ).href;
  }

  import PdfPage from "./PDFPage.svelte";

  import { pageSizes } from "@/api/pageSize.js";

  export let asset_url: URL = null;
  export let document: Document;
  export let scale: number | "width" | "height" = 1;
  export let pdf = new Promise(() => {}); // this is always a promise

  export let task: ReturnType<typeof pdfjs.getDocument> | undefined = null;

  $: sizes = pageSizes(document.page_spec);

  let progress = {
    loaded: 0,
    total: 0,
  };

  onMount(async () => {
    // we might move this to a load function
    if (!task) {
      task = pdfjs.getDocument({ url: asset_url });
      pdf = task.promise;
    }

    task.onProgress = (p) => {
      progress = p;
    };

    // @ts-ignore
    window.pdf = pdf;
  });
</script>

<div class="pages">
  {#each sizes as [width, height], n}
    <PdfPage page_number={n + 1} {pdf} {scale} {width} {height} />
  {/each}
</div>

<style>
  .pages {
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    gap: 3rem;
    width: 100%;
    overflow-x: auto;
  }
</style>
