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

  $: orientation = aspect > 1 ? "vertical" : "horizontal";

  // render when anything changes
  $: render(canvas, container, aspect, scale, pdf);

  function scaleToNumber(
    scale: number | "width" | "height",
    orientation: string,
  ): number {
    if (typeof scale === "number") return scale;

    if (orientation === "vertical") return 2;

    return 1;
  }

  async function render(
    canvas: HTMLCanvasElement,
    container: HTMLElement,
    aspect: number,
    scale: number | "width" | "height", // todo: convert width and height to a reasonable number
    pdf,
  ) {
    // check that we have things
    if (![canvas, container, aspect, scale, pdf].every(Boolean)) return;

    // be smarter about this eventually
    const numericScale = scaleToNumber(scale, orientation);

    const context = canvas.getContext("2d");
    const page = await pdf.getPage(page_number);
    const viewport = page.getViewport({ scale: numericScale });
    const dpr = window?.devicePixelRatio ?? 1;

    const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null;

    // set the pixel dimensions of the canvas
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);

    // set the container size, if using a numeric zoom
    if (typeof scale === "number") {
      container.style.setProperty("--width", Math.floor(viewport.width) + "px");
    } else if (scale === "height") {
      container.style.removeProperty("--width");
    }

    page.render({
      canvasContext: context,
      viewport,
      transform,
    });
  }
</script>

<Page {page_number} wide={scale === "width"} tall={scale === "height"}>
  <div
    bind:this={container}
    class="page-container scale-{scale} {orientation}"
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
    width: var(--width, "100%");
  }

  .page-container.scale-width {
    width: 100%;
  }

  .page-container.scale-height {
    height: 90vh;
  }

  canvas {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
  }
</style>
