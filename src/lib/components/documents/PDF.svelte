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
  // import * as pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?worker";

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url,
  ).href;

  import Page from "./Page.svelte";

  import { pageSizesFromSpec } from "@/api/pageSize.js";
  import { pdfUrl } from "$lib/api/documents";

  export let document: Document;
  export let scale = 1;

  let pdf;
  let canvasElements: HTMLCanvasElement[] = [];

  $: sizes = pageSizesFromSpec(document.page_spec);
  $: url = pdfUrl(document);

  async function render(canvas: HTMLCanvasElement, page_number: number) {
    const container = canvas.parentElement;
    const context = canvas.getContext("2d");
    const page = await pdf.getPage(page_number);
    const viewport = page.getViewport({ scale });
    const dpr = window?.devicePixelRatio ?? 1;

    const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null;

    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";
    container.style.width = Math.floor(viewport.width) + "px";
    container.style.height = Math.floor(viewport.height) + "px";

    page.render({
      canvasContext: context,
      viewport,
      transform,
    });
  }

  onMount(async () => {
    pdf = await pdfjs.getDocument(url.href).promise;

    // do this in a nicer way later
    canvasElements.forEach((canvas, n) => {
      render(canvas, n + 1);
    });
  });
</script>

<div class="pages">
  {#each sizes as aspect, n}
    <Page page_number={n + 1}>
      <div style="--aspect: {aspect};" class="page-container">
        <canvas bind:this={canvasElements[n]}></canvas>
      </div>
    </Page>
  {/each}
</div>

<style>
  .pages {
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    gap: 3rem;
  }

  .page-container {
    aspect-ratio: 1 / var(--aspect);
    margin: 0;
    position: relative;
    width: 100%;

    box-shadow: var(--shadow);
  }

  canvas {
    position: absolute;
  }
</style>
