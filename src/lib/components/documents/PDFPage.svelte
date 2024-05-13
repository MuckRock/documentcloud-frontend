<!-- @component
A single page of a PDF document.
This component exists to manage state and rendering for a single page,
working with PDF.svelte.
-->
<script lang="ts">
  import type { TextPosition } from "$lib/api/types";

  import { afterUpdate } from "svelte";
  import * as pdfjs from "pdfjs-dist/build/pdf.mjs";

  import Page from "./Page.svelte";

  export let aspect: number;
  export let page_number: number; // 1-indexed
  export let pdf; // PDFDocumentProxy
  export let scale: number | "width" | "height";
  export let text: TextPosition[] = [];

  let canvas: HTMLCanvasElement;
  let container: HTMLElement;

  // keep track of this in case we need it later
  let renderTask;

  // embedded text
  let textContainer: HTMLElement;
  let textContent: Promise<any>;

  $: orientation = aspect > 1 ? "vertical" : "horizontal";

  // render when anything changes
  $: page = pdf.getPage(page_number);
  $: textContent =
    !text.length &&
    page.then((p) => p.getTextContent({ includeMarkedContent: true }));
  // $: page.then((p) => render(p, canvas, container, scale));
  // $: page.then((p) => renderTextLayer(p, textContainer, scale));

  // debugging
  /*
  $: page.then((p) =>
    console.log(p.getViewport({ scale: scaleToNumber(scale, orientation) })),
  );
  $: textContent.then(console.log);
  */

  /**
   * Return a numeric scale based on intrinsic page size and container size
   * @param page
   * @param container
   */
  function fitPage(
    page,
    container: HTMLElement,
    scale: number | "width" | "height",
  ): number {
    if (typeof scale === "number") return scale;
    if (!container) return 1;

    const [x1, y1, width, height] = page.view;
    const { clientWidth, clientHeight } = container;

    return scale === "width" ? clientWidth / width : clientHeight / height;
  }

  async function render(
    page, // pdf.getPage
    canvas: HTMLCanvasElement,
    container: HTMLElement,
    scale: number | "width" | "height", // todo: convert width and height to a reasonable number
  ) {
    // only one render task at a time;
    if (renderTask) {
      await renderTask.promise;
    }

    // check that we have things
    if (![canvas, container, scale, page].every(Boolean)) return;

    // be smarter about this eventually
    const numericScale = fitPage(page, container, scale);

    const context = canvas.getContext("2d");
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

    // store the task, return the promise
    renderTask = page.render({
      canvasContext: context,
      viewport,
      transform,
    });

    return renderTask.promise;
  }

  async function renderTextLayer(
    page,
    textContainer: HTMLElement,
    pageContainer: HTMLElement,
    scale: number | "width" | "height",
  ) {
    if (text.length > 0) return;
    if (!textContainer) return;

    const numericScale = fitPage(page, pageContainer, scale);
    const viewport = page.getViewport({ scale: numericScale });
    const content = await page.getTextContent();

    // pdfjs scales text using this CSS property, so set it here when we know it
    textContainer.style.setProperty("--scale-factor", numericScale.toFixed(2));

    pdfjs.renderTextLayer({
      textContentSource: content,
      container: textContainer,
      viewport,
    });
  }

  afterUpdate(async () => {
    const p = await page;

    render(p, canvas, container, scale);
    renderTextLayer(p, textContainer, container, scale);
  });
</script>

<Page {page_number} wide={scale === "width"} tall={scale === "height"}>
  <div
    bind:this={container}
    class="page-container scale-{scale} {orientation}"
    style:--aspect={aspect}
  >
    <canvas bind:this={canvas}></canvas>
    {#if text.length > 0}
      <div bind:this={textContainer} class="selectable-text">
        {#each text as word}
          <span
            role="presentation"
            class="word"
            style="left: {word.x1 * 100}%; top: {word.y1 * 100}%;"
            >{word.text}</span
          >
        {/each}
      </div>
    {:else}
      <div bind:this={textContainer} class="selectable-text embedded">
        <!-- pdfjs.renderTextLayer will fill this in -->
      </div>
    {/if}
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

  .selectable-text {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    opacity: 0.5;
  }

  .selectable-text.embedded {
    position: absolute;
    text-align: initial;
    inset: 0;
    overflow: hidden;
    opacity: 1;
    line-height: 1;
    -webkit-text-size-adjust: none;
    -moz-text-size-adjust: none;
    text-size-adjust: none;
    forced-color-adjust: none;
    transform-origin: 0 0;
    caret-color: CanvasText;
  }

  .word {
    color: transparent;
    position: absolute;
  }

  .selectable-text.embedded :global(:is(span, br)) {
    color: transparent;
    position: absolute;
    white-space: pre;
    cursor: text;
    transform-origin: 0% 0%;
  }

  canvas {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
  }

  :global(.hiddenCanvasElement) {
    display: none;
  }
</style>
