<!--
  @component
  PDF.svelte is a rendered PDF document (which we're not calling "Document" to avoid naming collisions).
  It uses PDF.js to render the actual pages on canvas elements.

  This is only the pages of the document, contained inside the larger viewer.

  Assumes it's a child of a ViewerContext
-->

<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { onMount } from "svelte";

  import PdfPage from "./PDFPage.svelte";

  import { scrollToPage } from "$lib/utils/scroll";
  import { remToPx } from "$lib/utils/layout";
  import {
    getNotes,
    getSections,
    pageSizes,
    zoomToScale,
  } from "$lib/utils/viewer";
  import {
    getCurrentPage,
    getDocument,
    getPDF,
    getZoom,
  } from "./ViewerContext.svelte";

  const documentStore = getDocument();
  const currentPage = getCurrentPage();
  const pdf = getPDF();
  const zoom = getZoom();

  $: document = $documentStore;
  $: scale = zoomToScale($zoom);
  $: sizes = document.page_spec ? pageSizes(document.page_spec) : [];
  $: notes = getNotes(document);
  $: sections = getSections(document);

  onMount(() => {
    $pdf.then((p) => {
      // handle missing page_spec
      if (sizes.length === 0) {
        sizes = Array(p.numPages).fill([0, 0]);
      }

      if ($currentPage > 1) {
        scrollToPage($currentPage);
      }

      // @ts-ignore
      window.pdf = p;
    });
  });

  let width: number;
</script>

<div
  class="pages"
  bind:clientWidth={width}
  class:sm={width < remToPx(35)}
  class:lg={width > remToPx(70)}
>
  {#each sizes as [width, height], n}
    {@const page_number = n + 1}
    {#if sections[n]}
      <h3 class="section">
        {sections[n].title}
      </h3>
    {/if}
    <PdfPage {page_number} {scale} {width} {height} />
  {/each}
</div>

<style>
  .pages {
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    padding: 3rem;
    gap: 1.5rem;
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
  }
  .sm.pages {
    padding: 1.5rem;
    gap: 0.75rem;
  }
  .lg.pages {
    padding: 4.5rem;
    gap: 2.25rem;
  }
  .section {
    color: var(--gray-4);
    font-weight: var(--font-semibold);
    max-width: 66ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
