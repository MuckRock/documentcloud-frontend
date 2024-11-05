<!--
  @component
  PDF.svelte is a rendered PDF document (which we're not calling "Document" to avoid naming collisions).
  It uses PDF.js to render the actual pages on canvas elements.

  This is only the pages of the document, contained inside the larger viewer.

  Assumes it's a child of a ViewerContext
-->

<script lang="ts">
  import { onMount } from "svelte";

  import PdfPage from "./PDFPage.svelte";

  import { scrollToPage } from "$lib/utils/scroll";
  import { remToPx } from "$lib/utils/layout";
  import { getSections, pageSizes, zoomToScale } from "$lib/utils/viewer";
  import {
    getCurrentPage,
    getDocument,
    getErrors,
    getPDF,
    getZoom,
  } from "./ViewerContext.svelte";
  import Error from "../common/Error.svelte";

  const documentStore = getDocument();
  const currentPage = getCurrentPage();
  const pdf = getPDF();
  const zoom = getZoom();

  let width: number;

  $: document = $documentStore;
  $: scale = zoomToScale($zoom);
  $: sizes = document.page_spec ? pageSizes(document.page_spec) : [];
  $: sections = getSections(document);
  $: errors = getErrors();

  // handle missing page_spec
  $: $pdf
    .then((p) => {
      if (sizes.length === 0) {
        sizes = Array(p.numPages).fill([0, 0]);
      }
    })
    .catch((e) => {
      console.error(e);
      errors.update((errs) => [...errs, e]);
    });

  onMount(() => {
    $pdf
      .then((p) => {
        if ($currentPage > 1) {
          scrollToPage($currentPage);
        }

        // @ts-ignore
        window.pdf = p;
      })
      .catch((e) => {
        console.error(e);
        errors.update((errs) => [...errs, e]);
      });
  });
</script>

{#if Boolean($errors?.length)}
  <Error>
    {#each $errors as error}
      <p>{String(error)}</p>
    {/each}
  </Error>
{:else}
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
{/if}

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
