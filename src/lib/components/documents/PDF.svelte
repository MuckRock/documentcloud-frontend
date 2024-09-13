<!--
  @component
  PDF.svelte is a rendered PDF document (which we're not calling "Document" to avoid naming collisions).
  It uses PDF.js to render the actual pages on canvas elements.

  This is only the pages of the document, contained inside the larger viewer.
-->

<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { onMount } from "svelte";

  import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.mjs",
      import.meta.url,
    ).href;
  }

  import PdfPage from "./PDFPage.svelte";

  import { pageSizes } from "@/api/pageSize.js";

  export let asset_url: URL = null;
  export let document: Document;
  export let query: string = ""; // search query
  export let scale: number | "width" | "height" = 1;

  // https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFDocumentProxy.html
  export let pdf: Promise<any> = new Promise(() => {});
  export let task: ReturnType<typeof pdfjs.getDocument> | undefined = null;

  $: sizes = document.page_spec ? pageSizes(document.page_spec) : [];

  // index notes and sections by page
  $: notes = document.notes.reduce((m, note) => {
    if (!m[note.page_number]) {
      m[note.page_number] = [];
    }
    m[note.page_number].push(note);
    return m;
  }, {});

  $: sections = document.sections.reduce((m, section) => {
    m[section.page_number] = section;
    return m;
  }, {});

  let progress = {
    loaded: 0,
    total: 0,
  };

  onMount(() => {
    // we might move this to a load function
    if (!task) {
      task = pdfjs.getDocument({ url: asset_url });
      pdf = task.promise;
    }

    task.onProgress = (p) => {
      progress = p;
    };

    pdf.then((p) => {
      // handle missing page_spec
      if (sizes.length === 0) {
        sizes = Array(p.numPages).fill([0, 0]);
      }

      // @ts-ignore
      window.pdf = p;
    });
  });
</script>

<div class="pages">
  {#each sizes as [width, height], n}
    {@const page_number = n + 1}
    <PdfPage
      {document}
      {page_number}
      {pdf}
      {scale}
      {width}
      {height}
      {query}
      section={sections[n]}
      notes={notes[n]}
    />
  {/each}
</div>

<style>
  .pages {
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    padding: 3rem;
    gap: 3rem;
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
  }
</style>
