<!-- @component
A single page of a PDF document.
This component exists to manage state and rendering for a single page,
working with PDF.svelte.

Selectable text can be rendered in one of two ways:
- Extracted from the PDF page (preferred)
- Passed in as a server-fetched JSON object
-->
<script lang="ts">
  import type { TextPosition } from "$lib/api/types";

  import * as pdfjs from "pdfjs-dist/build/pdf.mjs";

  import Page from "./Page.svelte";

  export let page_number: number; // 1-indexed
  export let pdf; // Promise<PDFDocumentProxy>
  export let scale: number | "width" | "height";
  export let text: TextPosition[] = [];
  export let width: number;
  export let height: number;

  let canvas: HTMLCanvasElement;
  let container: HTMLElement;
  let textContainer: HTMLElement;

  // keep track of this to avoid overlapping renders
  let renderTask;
  let loaded = false;

  // visibility, for loading optimization
  let visible: boolean = false;

  $: aspect = height / width;
  $: orientation = height > width ? "vertical" : "horizontal";
  $: numericScale = fitPage(width, height, container, scale);

  // render when anything changes
  $: page =
    visible && Promise.resolve(pdf).then((pdf) => pdf?.getPage(page_number));

  // we need to wait on both promises to render on initial load
  $: Promise.all([pdf, page]).then(([pdf, page]) => {
    render(page, canvas, container, scale);
    renderTextLayer(page, textContainer, container, scale);
  });

  /**
   * Return a numeric scale based on intrinsic page size and container size
   * @param width Original document width
   * @param height Original document height
   * @param container
   * @param scale
   */
  function fitPage(
    width: number,
    height: number,
    container: HTMLElement,
    scale: number | "width" | "height",
  ): number {
    if (typeof scale === "number") return scale;
    if (!container) return 1;

    // const [x1, y1, width, height] = page.view;
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

    const numericScale = fitPage(width, height, container, scale);
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
    loaded = true;
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

    // page = await page;
    if (!page) return;

    const numericScale = fitPage(width, height, pageContainer, scale);
    const viewport = page.getViewport({ scale: numericScale });
    const content = await page.getTextContent();

    // svelte's reactivity ends up a step behind, so do this here
    container.style.setProperty("--scale-factor", numericScale.toFixed(2));

    pdfjs.renderTextLayer({
      textContentSource: content,
      container: textContainer,
      viewport,
    });
  }

  function onResize(e) {
    numericScale = fitPage(width, height, container, scale);
  }
</script>

<svelte:window on:resize={onResize} />

<Page
  {page_number}
  wide={scale === "width"}
  tall={scale === "height"}
  track
  let:visible
  on:visible={() => {
    visible = true;
  }}
>
  <div
    bind:this={container}
    class="page-container scale-{scale} {orientation}"
    class:visible
    style:--aspect={aspect}
    style:--scale-factor={numericScale.toFixed(2)}
    style:--width="{width}px"
    data-loaded={loaded}
  >
    <canvas bind:this={canvas} {width} {height}></canvas>
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

    background-color: var(--white, white);
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

  .word {
    color: transparent;
    position: absolute;
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

  .selectable-text.embedded :global(:is(span, br)) {
    color: transparent;
    position: absolute;
    white-space: pre;
    cursor: text;
    transform-origin: 0% 0%;
  }

  .selectable-text :global(br) {
    user-select: none;
  }

  canvas {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
  }

  /* pdfjs creates this */
  :global(.hiddenCanvasElement) {
    display: none;
  }
</style>
