<!-- @component
A single page of a PDF document.
This component exists to manage state and rendering for a single page,
working with PDF.svelte.
-->
<script lang="ts">
  import Page from "./Page.svelte";

  export let aspect: number;
  export let page_number: number; // 1-indexed
  export let pdf; // PDFDocumentProxy
  export let scale: number | "width" | "height";

  let canvas: HTMLCanvasElement;
  let container: HTMLElement;

  async function render(
    canvas: HTMLCanvasElement,
    container: HTMLElement,
    aspect: number,
    scale: number | "width" | "height",
    pdf,
  ) {
    // check that we have things
    if (![canvas, container, aspect, scale, pdf].every(Boolean)) return;

    // be smarter about this eventually
    const numericScale = typeof scale === "number" ? scale : 1;

    const context = canvas.getContext("2d");
    const page = await pdf.getPage(page_number);
    const viewport = page.getViewport({ scale: numericScale });
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

  // render when anything changes
  $: render(canvas, container, aspect, scale, pdf);
</script>

<Page {page_number}>
  <div
    bind:this={container}
    class="page-container scale-{scale}"
    style="--aspect: {aspect};"
  >
    <canvas bind:this={canvas}></canvas>
  </div>
</Page>

<style>
  .page-container {
    aspect-ratio: 1 / var(--aspect);
    margin: 0;
    position: relative;

    box-shadow: var(--shadow);
  }

  .page-container.scale-width {
    width: 100%;
  }

  .page-container.scale-height {
    height: 100%;
  }

  canvas {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
  }
</style>
