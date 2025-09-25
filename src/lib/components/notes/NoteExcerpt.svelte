<script lang="ts">
  // TODO: Excerpt rendering sometimes fails
  // https://github.com/MuckRock/documentcloud-frontend/issues/1150
  import { _ } from "svelte-i18n";
  import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
  import type { Document, Note, Sizes } from "$lib/api/types";
  import { pageImageUrl } from "$lib/api/documents";
  import { width, height } from "$lib/api/notes";
  import { getDocument, getPDF } from "$lib/components/viewer/ViewerContext.svelte";
  import { getViewerHref } from "@/lib/utils/viewer";

  export let document = getDocument();
  export let note: Note;
  export let scale = 2;
  
  const pdf = getPDF();
  const SIZE: Sizes = "large";
  let canvas: HTMLCanvasElement;
  let rendering: Promise<any>;
  type AsyncPDF = typeof $pdf;

  $: doc = $document;
  $: page_number = note.page_number + 1; // note pages are 0-indexed
  $: rendering = render(canvas, doc, $pdf); // avoid re-using the same canvas
  $: page_url = getViewerHref({ document: doc, page: page_number });

  async function render(
    canvas: HTMLCanvasElement,
    document: Document,
    pdf: AsyncPDF,
  ) {
    if (!canvas) return;
    if (rendering) {
      await rendering;
    }

    if (pdf) {
      const resolvedPdf = await pdf;
      return renderPDF(canvas, resolvedPdf);
    }

    if (document && !pdf) {
      return renderImage(canvas, document);
    }

    // we don't have a pdf or a document, for some reason
    console.error(`Can't render note ${note.id} on page ${page_number}.`);
  }

  async function renderImage(canvas: HTMLCanvasElement, document: Document) {
    const context = canvas.getContext("2d");
    if (!context) {
      console.error("Missing canvas context when rendering image in note.");
      return;
    }

    const image = new Image();

    let src = pageImageUrl(document, page_number, SIZE);

    image.src = src.href;
    image.addEventListener("load", (e) => {
      canvas.width = width(note) * image.width;
      canvas.height = height(note) * image.height;
      context.drawImage(
        image,
        note.x1 * image.width,
        note.y1 * image.height,
        width(note) * image.width,
        height(note) * image.height,
        0,
        0,
        width(note) * image.width,
        height(note) * image.height,
      );
    });
  }

  async function renderPDF(canvas: HTMLCanvasElement, pdf: PDFDocumentProxy) {
    const context = canvas.getContext("2d");
    if (!context) {
      console.error("Missing canvas context when rendering PDF in note.");
      return;
    }

    const page = await pdf.getPage(page_number);
    const [x, y, w, h] = page.view;

    if (!w || !h) {
      console.error("Missing page dimensions when rendering PDF in note.");
      return;
    }

    const offsetX = note.x1 * w * scale;
    const offsetY = note.y1 * h * scale;
    const noteWidth = width(note) * w * scale;
    const noteHeight = height(note) * h * scale;
    const viewport = page.getViewport({
      scale,
      offsetX: -offsetX,
      offsetY: -offsetY,
    });

    const dpr = window?.devicePixelRatio ?? 1;
    const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined;

    // set the pixel dimensions of the canvas
    canvas.width = Math.floor(noteWidth * dpr);
    canvas.height = Math.floor(noteHeight * dpr);

    const renderTask = page.render({
      canvasContext: context,
      viewport,
      transform,
    });

    return renderTask.promise;
  }
</script>

<div class="note-excerpt">
  <a class="page-number" href={page_url}>{$_("documents.pageAbbrev")} {page_number}</a>
  <div class="highlight {note.access}">
    <canvas width="0" height="0" bind:this={canvas}></canvas>
  </div>
</div>

<style>
  canvas {
    max-width: 100%;
    padding: 0 1rem;
  }

  .page-number {
    display: block;
    margin-bottom: 0.25rem;
    color: var(--gray-4, #5c717c);
    font-size: var(--font-sm, 0.875rem);
    text-decoration: none;
  }

  .highlight {
    align-self: stretch;
    border-radius: 0.5rem;
    border: 2px solid var(--gray-2, #d8dee2);
    background: var(--gray-1, #f5f6f7);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .public.highlight {
    border-color: var(--note-public);
  }

  .private.highlight {
    border-color: var(--note-private);
  }

  .organization.highlight {
    border-color: var(--note-org);
  }
</style>