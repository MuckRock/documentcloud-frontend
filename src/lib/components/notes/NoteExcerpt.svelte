<script lang="ts">
  import type { Document, Note } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { getPDF } from "$lib/components/viewer/ViewerContext.svelte";
  import { getViewerHref } from "$lib/utils/viewer";
  import { renderImage, renderPDF } from "$lib/utils/notes";

  interface Props {
    document: Document;
    note: Note;
    scale?: number;
  }

  type AsyncPDF = typeof $pdf;

  let { document, note, scale = 2 }: Props = $props();

  const pdf = getPDF();

  let canvas: HTMLCanvasElement | undefined = $state();

  // avoid re-using the same canvas
  let rendering: Promise<any> = $derived.by(() => {
    if (!canvas) return Promise.resolve(false);
    return render(canvas, document, $pdf);
  });

  async function render(
    canvas: HTMLCanvasElement,
    document: Document,
    pdf: AsyncPDF,
  ) {
    if (!canvas) return;
    if (rendering) {
      await rendering.catch(console.error);
    }

    if (pdf) {
      const resolvedPdf = await pdf;
      return renderPDF(note, scale, canvas, resolvedPdf);
    }

    if (document && !pdf) {
      return renderImage(note, canvas, document);
    }

    // we don't have a pdf or a document, for some reason
    console.error(`Can't render note ${note.id} on page ${page_number}.`);
    console.error({ document, pdf });
  }

  let page_number = $derived(note.page_number + 1); // note pages are 0-indexed
  let page_url = $derived(
    getViewerHref({ document: document, page: page_number }),
  );
</script>

<div class="note-excerpt">
  <a class="page-number" href={page_url}>
    {$_("documents.pageAbbrev")}
    {page_number}
  </a>
  <div class="highlight {note.access}">
    <canvas width="0" height="0" bind:this={canvas}></canvas>
  </div>
</div>

<style>
  canvas {
    max-width: 100%;
    padding: 0;
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
    border: 1px solid var(--gray-2, #d8dee2);
    background: var(--gray-1, #f5f6f7);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
</style>
