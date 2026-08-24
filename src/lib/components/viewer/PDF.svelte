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
  import { Virtualizer, type VirtualizerHandle } from "virtua/svelte";

  import PdfPage from "./PDFPage.svelte";

  import { scrollToPage } from "$lib/utils/scroll";
  import { getSections } from "$lib/utils/viewer";
  import { getViewerState } from "$lib/state/viewer.svelte";
  import { pinchZoom, type PinchZoomOptions } from "$lib/utils/pinchZoom";
  import Error from "../common/Error.svelte";

  const viewer = getViewerState();

  let virtualizer = $state<VirtualizerHandle>();

  let pinching = $state(false);
  let pinchEnabled = $derived(viewer.mode === "document");

  let pinchZoomOptions = $derived<PinchZoomOptions>({
    enabled: () => pinchEnabled,
    getScale: () => viewer.scale,
    setZoom: (scale) => {
      viewer.zoom = scale;
    },
    min: 0.4,
    max: 2.5,
    onPinchStart: () => (pinching = true),
    onPinchEnd: () => (pinching = false),
    findItemByOffset: (offset) => {
      if (!virtualizer) return null;
      const index = virtualizer.findItemIndex(
        offset + virtualizer.getScrollOffset(),
      );
      return globalThis.document.getElementById(`document/p${index + 1}`);
    },
  });

  let document = $derived(viewer.document!);
  let sizes = $derived(viewer.pageSizes);
  let sections = $derived(getSections(document));
  let scale = $derived(viewer.scale);

  // The scrolling ancestor is div#content in SidebarLayout.svelte
  let scrollRef = $derived(globalThis.document.getElementById("content")!);

  // Virtua's container uses `contain: size` and each item is `width: 100%`, so
  // wider-than-viewport pages can't push it out on their own. Set the widest
  // scaled page as `width` on an inner div so `.pages` gets scrollable overflow.
  let maxPageWidth = $derived(viewer.maxPageWidth * scale);

  // handle missing page_spec
  // (PDF normally only renders when the viewer loads one, but guard `pdf` in
  // case this component ends up in a viewer that never loads a PDF)
  $effect(() => {
    const pdf = viewer.pdf;
    if (!pdf) return;
    pdf
      .then((p) => {
        if (sizes.length === 0) {
          viewer.pageSizes = Array(p.numPages).fill([0, 0]);
        }
      })
      .catch((e) => {
        console.warn(e);
        viewer.errors = [...viewer.errors, e];
      });
  });

  onMount(() => {
    const pdf = viewer.pdf;
    if (!pdf) return;
    pdf
      .then((p) => {
        // This is what holds your place when you switch into document mode:
        // mode links carry no page hash, so nothing else scrolls here. On a
        // fresh load `viewer.pdf` is still the placeholder promise at this
        // point, and ViewerContext's afterNavigate does the scrolling instead.
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
  <!--
    Page spacing scales with the width of the viewer (the window minus any open
    sidebars), not the window. Container queries against this wrapper resolve
    during the first layout, so pages are never laid out at one spacing and then
    resized — which would shift every page below the change (#1203).
  -->
  <div class={["sizer", { pinch: pinchEnabled }]}>
    <div class="pages" {@attach pinchZoom(pinchZoomOptions)}>
      <div class="inner" bind:clientWidth={viewer.width}>
        <div
          class="column"
          style:width="{maxPageWidth}px"
          style:--pin-width="{viewer.width}px"
        >
          {#if browser && viewer.width !== undefined}
            <Virtualizer
              bind:this={virtualizer}
              data={sizes}
              {scrollRef}
              itemProps={() => ({
                style: { display: "flex", "justify-content": "center" },
              })}
            >
              {#snippet children([width, height], n)}
                {@const page_number = n + 1}
                <div class={["page", { last: n === sizes.length - 1 }]}>
                  {#if sections[n]}
                    <h3 class="section pin-x">
                      {sections[n].title}
                    </h3>
                  {/if}
                  <PdfPage {page_number} {scale} {width} {height} {pinching} />
                </div>
              {/snippet}
            </Virtualizer>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* An element can't respond to its own size, so `.pages` queries this. */
  .sizer {
    container-type: inline-size;
    width: 100%;
  }
  .pages {
    padding: 3rem;
    overflow-x: auto;
    overflow-y: hidden;
    width: 100%;
  }
  .inner {
    margin: 0 auto;
    width: 100%;
    display: flex;
    justify-content: safe center;
  }
  .column {
    flex: none;
  }

  .page {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .page,
  .section {
    margin-bottom: 1.5rem;
  }

  .page.last {
    margin-bottom: 0;
  }

  .pinch {
    touch-action: pan-x pan-y;
  }

  @container (width < 35rem) {
    .pages {
      padding: 1.5rem;
    }
    .page,
    .section {
      margin-bottom: 0.75rem;
    }
  }
  @container (width > 70rem) {
    .pages {
      padding: 4.5rem;
    }
    .page,
    .section {
      margin-bottom: 2.25rem;
    }
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
