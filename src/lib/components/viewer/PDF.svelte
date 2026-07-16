<!--
  @component
  PDF.svelte is a rendered PDF document (which we're not calling "Document" to avoid naming collisions).
  It uses PDF.js to render the actual pages on canvas elements.

  This is only the pages of the document, contained inside the larger viewer.

  Must be a child of a ViewerContext
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from "svelte";

  import PdfPage from "./PDFPage.svelte";

  import { scrollToPage } from "$lib/utils/scroll";
  import { remToPx } from "$lib/utils/layout";
  import { getSections, pageSizes, zoomToScale } from "$lib/utils/viewer";
  import { getViewerState } from "$lib/state/viewer.svelte";
  import Error from "../common/Error.svelte";

  const viewer = getViewerState();

  let width: number = $state(800);

  let document = $derived(viewer.document!);
  let scale = $derived(zoomToScale(viewer.zoom));
  let sizes = $derived(document.page_spec ? pageSizes(document.page_spec) : []);
  let sections = $derived(getSections(document));

  // handle missing page_spec
  // (PDF is only rendered when the viewer loads one, so `pdf` is non-null here)
  $effect(() => {
    viewer
      .pdf!.then((p) => {
        if (sizes.length === 0) {
          sizes = Array(p.numPages).fill([0, 0]);
        }
      })
      .catch((e) => {
        console.warn(e);
        viewer.errors = [...viewer.errors, e];
      });
  });

  onMount(() => {
    viewer
      .pdf!.then((p) => {
        if (viewer.page > 1) {
          scrollToPage(viewer.page);
        }

        // @ts-ignore
        window.pdf = p;
      })
      .catch((e) => {
        console.warn(e);
        viewer.errors = [...viewer.errors, e];
      });
  });
</script>

{#if Boolean(viewer.errors?.length)}
  <Error>
    {#each viewer.errors as error}
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
    {#if browser}
      {#each sizes as [width, height], n}
        {@const page_number = n + 1}
        {#if sections[n]}
          <h3 class="section">
            {sections[n].title}
          </h3>
        {/if}
        <PdfPage {page_number} {scale} {width} {height} />
      {/each}
    {/if}
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
