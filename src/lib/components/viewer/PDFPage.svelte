<!-- @component
A single page of a PDF document.
This component exists to manage state and rendering for a single page,
working with PDF.svelte.

Assumes it's a child of a ViewerContext

Selectable text can be rendered in one of two ways:
- Extracted from the PDF page (preferred)
- Passed in as a server-fetched JSON object
-->
<script lang="ts">
  import type { TextPosition } from "$lib/api/types";

  import { page as pageStore } from "$app/stores";

  import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
  import { _ } from "svelte-i18n";

  // page parts
  import AnnotationLayer from "./AnnotationLayer.svelte";
  import Note from "./Note.svelte";
  import Page from "./Page.svelte";
  import RedactionLayer, { pending, redactions } from "./RedactionLayer.svelte";

  // writable ui
  import { highlight } from "$lib/utils/search";
  import { isPageLevel } from "$lib/api/notes";
  import {
    getDocument,
    getCurrentMode,
    getPDF,
  } from "$lib/components/viewer/ViewerContext.svelte";
  import { getQuery } from "$lib/utils/search";
  import { fitPage, getNotes } from "$lib/utils/viewer";

  export let page_number: number; // 1-indexed

  export let scale: number | "width" | "height";
  export let width: number;
  export let height: number;
  export let text: TextPosition[] = [];
  export let query: string = getQuery($pageStore.url, "q");

  const documentStore = getDocument();
  const mode = getCurrentMode();
  const pdf = getPDF();

  // make hidden things visible, for debugging
  export let debug = false;

  let canvas: HTMLCanvasElement;
  let container: HTMLElement;
  let textContainer: HTMLElement;

  // keep track of this to avoid overlapping renders
  let renderTask;
  let textPromise: Promise<void>; // resolves when text is rendered
  let loaded = false;
  let textLayer: pdfjs.TextLayer; // TextLayer

  // visibility, for loading optimization
  let visible: boolean = false;

  $: query = getQuery($pageStore.url, "q");
  $: document = $documentStore;
  $: aspect = height / width;
  $: orientation = height > width ? "vertical" : "horizontal";
  $: numericScale = fitPage(width, height, container, scale);

  // render when anything changes
  $: page =
    visible && Promise.resolve($pdf).then((pdf) => pdf?.getPage(page_number));

  // we need to wait on both promises to render on initial load
  $: Promise.all([$pdf, page]).then(([pdf, page]) => {
    render(page, canvas, container, scale);
    textPromise = renderTextLayer(page, textContainer, container, scale);
  });

  $: textPromise?.then(() => {
    markHighlights(textContainer, query);
  });

  // handle 0 sizing when page_spec is unavailable
  $: if (page && width === 0 && height === 0) {
    page.then((p) => {
      // It's safe to assume that PDFPageProxy.view is 4 elements long
      width = p.view[2]!;
      height = p.view[3]!;
    });
  }

  $: redactions_for_page = [
    ...($pending[document.id] ?? []),
    ...($redactions[document.id] ?? []),
  ].filter((r) => r.page_number === page_number - 1);

  $: page_level_notes =
    getNotes(document)[page_number - 1]?.filter((n) => isPageLevel(n)) ?? [];

  async function render(
    page, // pdf.getPage
    canvas: HTMLCanvasElement,
    container: HTMLElement,
    scale: number | "width" | "height",
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
    page, // PdfPageProxy
    textContainer: HTMLElement,
    pageContainer: HTMLElement,
    scale: number | "width" | "height",
  ) {
    if (text.length > 0) return;
    if (!textContainer) return;

    if (!page) return;

    const numericScale = fitPage(width, height, pageContainer, scale);
    const viewport = page.getViewport({ scale: numericScale });
    const content = await page.getTextContent();

    // svelte's reactivity ends up a step behind, so do this here
    container.style.setProperty("--scale-factor", numericScale.toFixed(2));

    textLayer = new pdfjs.TextLayer({
      textContentSource: content,
      container: textContainer,
      viewport,
    });

    return textLayer.render();
  }

  function markHighlights(textContainer: HTMLElement, query: string) {
    if (!query || !textContainer) return;
    container.querySelectorAll("span").forEach((span) => {
      if (span.textContent) {
        span.innerHTML = highlight(span.textContent, query);
      }
    });
  }

  // if I click on a note, pass click events through to underlying note text
  function checkForHighlightClick(click: MouseEvent) {
    const clickX = click.clientX;
    const clickY = click.clientY;

    const highlights: NodeListOf<HTMLElement> =
      container.querySelectorAll(".note-highlight");
    highlights.forEach((highlight) => {
      const { top, left, right, bottom } = highlight.getBoundingClientRect();
      const isSelectionClick = window.getSelection()?.type === "Range";
      const isNoteClick =
        clickX >= left &&
        clickX <= right &&
        clickY >= top &&
        clickY <= bottom &&
        !isSelectionClick;
      if (isNoteClick) {
        highlight.click();
      }
    });
  }

  function onResize() {
    numericScale = fitPage(width, height, container, scale);
  }

  function onVisibilityChange() {
    if (window.document.visibilityState === "visible" && !canvas.hidden) {
      Promise.all([$pdf, page]).then(([pdf, page]) => {
        render(page, canvas, container, scale);
      });
    }
  }

  let pageWidth: number;
</script>

<svelte:window on:resize={onResize} />

<svelte:document on:visibilitychange={onVisibilityChange} />

<Page
  {page_number}
  wide={scale === "width"}
  tall={scale === "height"}
  track
  let:visible
  on:visible={() => {
    visible = true;
  }}
  bind:width={pageWidth}
>
  {#if page_level_notes.length}
    <div class="page-notes">
      {#each page_level_notes as note}
        <Note {note} />
      {/each}
    </div>
  {/if}

  <div
    bind:this={container}
    class="page-container scale-{scale} {orientation}"
    class:visible
    class:debug
    style:--aspect={aspect}
    style:--scale-factor={numericScale.toFixed(2)}
    style:--width="{width}px"
    style:--height="{height}px"
    data-loaded={loaded}
    on:click={checkForHighlightClick}
    on:keydown={checkForHighlightClick}
    role="none"
    tabindex="-1"
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

    <AnnotationLayer page_number={page_number - 1} />

    {#if redactions_for_page.length > 0 || $mode === "redacting"}
      <RedactionLayer
        page_number={page_number - 1}
        active={$mode === "redacting"}
        id={document.id.toString()}
      />
    {/if}
  </div>
</Page>

<style>
  .page-container {
    aspect-ratio: 1 / var(--aspect);
    margin: 0;
    position: relative;

    background-color: var(--white, white);
    box-shadow: var(--shadow-1);
    width: var(--width, "100%");
  }

  .page-container.scale-width {
    width: 100%;
  }

  .page-container.scale-height {
    aspect-ratio: 1 / var(--aspect);
    height: 90vh;
    width: inherit;
  }

  .page-notes {
    display: flex;
    flex-flow: column nowrap;
    gap: 1rem;
    width: 100%;
    margin-bottom: 1rem;
  }

  .selectable-text {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
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

  .debug .selectable-text.embedded :global(:is(span, br)) {
    color: red;
  }

  .selectable-text :global(br) {
    user-select: none;
  }

  .selectable-text :global(mark) {
    background-color: var(--note-public, mark);
    color: transparent;
    opacity: 0.35;
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
