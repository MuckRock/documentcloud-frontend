<!-- @component
A single page of a PDF document.
This component exists to manage state and rendering for a single page,
working with PDF.svelte.

Must be a child of a ViewerContext

Selectable text can be rendered in one of two ways:
- Extracted from the PDF page (preferred)
- Passed in as a server-fetched JSON object
-->
<script lang="ts">
  import type { Maybe, TextPosition } from "$lib/api/types";

  import { page as pageState } from "$app/state";

  import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
  import { _ } from "svelte-i18n";

  // page parts
  import AnnotationLayer from "./AnnotationLayer.svelte";
  import Note from "../notes/Note.svelte";
  import Page from "./Page.svelte";
  import RedactionLayer, { pending, redactions } from "./RedactionLayer.svelte";

  // writable ui
  import { highlight } from "$lib/utils/search";
  import { isPageLevel } from "$lib/api/notes";
  import { getViewerState } from "$lib/state/viewer.svelte";
  import { getQuery } from "$lib/utils/search";
  import { fitPage, getNotes } from "$lib/utils/viewer";

  const viewer = getViewerState();

  interface Props {
    page_number: number; // 1-indexed
    scale: number | "width" | "height";
    width: number;
    height: number;
    text?: TextPosition[];
    query?: string;
    // make hidden things visible, for debugging
    debug?: boolean;
  }

  let {
    page_number,
    scale,
    width = $bindable(),
    height = $bindable(),
    text = [],
    query = $bindable(getQuery(pageState.url, "q")),
    debug = false,
  }: Props = $props();

  let canvas: Maybe<HTMLCanvasElement> = $state();
  let container: Maybe<HTMLElement> = $state();
  let textContainer: Maybe<HTMLElement> = $state();

  // keep track of this to avoid overlapping renders
  let renderTask;
  let textPromise: Maybe<Promise<void>> = $state(); // resolves when text is rendered
  let loaded = $state(false);
  let textLayer: pdfjs.TextLayer; // TextLayer

  // visibility, for loading optimization
  let visible: boolean = $state(false);

  async function render(
    page, // pdf.getPage
    canvas: Maybe<HTMLCanvasElement>,
    container: Maybe<HTMLElement>,
    scale: number | "width" | "height",
  ) {
    // only one render task at a time;
    if (renderTask) {
      await renderTask.promise;
    }

    // check that we have things
    if (!canvas || !container || !scale || !page) return;

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
    textContainer: Maybe<HTMLElement>,
    pageContainer: Maybe<HTMLElement>,
    scale: number | "width" | "height",
  ) {
    if (text.length > 0) return;
    if (!textContainer) return;

    if (!page) return;

    const numericScale = fitPage(width, height, pageContainer, scale);
    const viewport = page.getViewport({ scale: numericScale });
    const content = await page.getTextContent();

    // svelte's reactivity ends up a step behind, so do this here
    container?.style.setProperty("--scale-factor", numericScale.toFixed(2));

    textLayer = new pdfjs.TextLayer({
      textContentSource: content,
      container: textContainer,
      viewport,
    });

    return textLayer.render();
  }

  function markHighlights(textContainer: Maybe<HTMLElement>, query: string) {
    if (!query || !textContainer || !container) return;
    container.querySelectorAll("span").forEach((span) => {
      if (span.textContent) {
        span.innerHTML = highlight(span.textContent, query);
      }
    });
  }

  // if I click on a note, pass click events through to underlying note text
  function checkForHighlightClick(click: MouseEvent) {
    // The open note card (the read view or the edit form) and note tabs handle
    // their own clicks. Don't forward those clicks to a highlight just because
    // they overlap its bounds — otherwise clicking inside an open EditNote form
    // reopens the note beneath it and editing becomes impossible.
    if ((click.target as HTMLElement)?.closest(".note.card, .note-tab")) return;
    if (!container) return;

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
    if (
      window.document.visibilityState === "visible" &&
      canvas &&
      !canvas.hidden
    ) {
      Promise.all([viewer.pdf, page]).then(([pdf, page]) => {
        render(page, canvas, container, scale);
      });
    }
  }

  let pageWidth: Maybe<number> = $state();
  $effect(() => {
    query = getQuery(pageState.url, "q");
  });
  let document = $derived(viewer.document!);
  // render when anything changes
  // (PDFPage normally only renders when the viewer loads a PDF, but guard `pdf`
  // in case this component ends up in a viewer that never loads a PDF)
  let page = $derived(
    visible && viewer.pdf
      ? Promise.resolve(viewer.pdf).then((pdf) => pdf.getPage(page_number))
      : undefined,
  );
  // handle 0 sizing when page_spec is unavailable
  $effect(() => {
    // Capture the derived value in a local so TS can narrow it; reading the
    // `page` accessor twice (guard + `.then`) would not narrow.
    const pagePromise = page;
    if (pagePromise && width === 0 && height === 0) {
      pagePromise.then((p) => {
        // It's safe to assume that PDFPageProxy.view is 4 elements long
        width = p.view[2]!;
        height = p.view[3]!;
      });
    }
  });
  let aspect = $derived(height / width);
  let orientation = $derived(height > width ? "vertical" : "horizontal");
  // Recomputed reactively when its inputs change; `onResize` also writes to
  // it directly to pick up window resizes, which don't emit a reactive signal.
  let numericScale = $derived(fitPage(width, height, container, scale));
  // we need to wait on both promises to render on initial load
  $effect(() => {
    // Read `scale` synchronously so the effect tracks it as a dependency;
    // reading it only inside the async `.then` below would not register it,
    // and numeric zoom changes (which flow through `scale`) wouldn't re-render.
    const currentScale = scale;
    Promise.all([viewer.pdf, page]).then(([pdf, page]) => {
      render(page, canvas, container, currentScale);
      textPromise = renderTextLayer(
        page,
        textContainer,
        container,
        currentScale,
      );
    });
  });
  $effect(() => {
    // Read `query` synchronously so the effect re-runs when the search query
    // changes; reading it only inside the async `.then` would not track it.
    const currentQuery = query;
    textPromise?.then(() => {
      markHighlights(textContainer, currentQuery);
    });
  });
  let redactions_for_page = $derived(
    [
      ...($pending[document.id] ?? []),
      ...($redactions[document.id] ?? []),
    ].filter((r) => r.page_number === page_number - 1),
  );
  let page_level_notes = $derived(
    getNotes(document)[page_number - 1]?.filter((n) => isPageLevel(n)) ?? [],
  );
</script>

<svelte:window onresize={onResize} />

<svelte:document onvisibilitychange={onVisibilityChange} />

<Page
  {page_number}
  wide={scale === "width"}
  tall={scale === "height"}
  track
  onvisible={() => {
    visible = true;
  }}
  bind:width={pageWidth}
>
  {#snippet children({ visible })}
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
      onclick={checkForHighlightClick}
      onkeydown={checkForHighlightClick}
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

      {#if redactions_for_page.length > 0 || viewer.mode === "redacting"}
        <RedactionLayer
          page_number={page_number - 1}
          active={viewer.mode === "redacting"}
          id={document.id.toString()}
        />
      {/if}
    </div>
  {/snippet}
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
