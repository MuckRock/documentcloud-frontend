<!--
  @component
  Show a grid of thumbnail images for a single document.
  Each image should link to its respective page.

  Must be a child of a ViewerContext.

  Pages are only rendered in the browser to limit server-side page size.
-->
<script lang="ts">
  import type { Sizes } from "$lib/api/types";

  import { browser } from "$app/environment";
  import { _ } from "svelte-i18n";
  import { VMasonry } from "virtua/svelte";

  import Page from "./Page.svelte";

  import { IMAGE_WIDTHS_MAP } from "@/config/config.js";
  import { pageImageUrl } from "$lib/api/documents";
  import { getViewerState } from "$lib/state/viewer.svelte";
  import { zoomToSize } from "$lib/utils/viewer";

  interface Props {
    size?: Sizes;
  }

  let { size = "thumbnail" }: Props = $props();

  const viewer = getViewerState();

  const SCALE = {
    thumbnail: 1,
    small: 1,
    normal: 3,
    large: 3,
  };

  const GAP = 24;
  const PADDING = 32;

  let document = $derived(viewer.document!);
  $effect(() => {
    size = zoomToSize(viewer.zoom);
  });

  let containerWidth = $state(0);

  let pages = $derived(viewer.pages);
  let scale = $derived(SCALE[size] ?? 1);
  let width = $derived((IMAGE_WIDTHS_MAP.get(size) ?? 180) / scale);
  let maxHeight = $derived(
    width / Math.min(...pages.map(({ aspectRatio }) => aspectRatio)),
  );
  let lanes = $derived(
    Math.max(
      1,
      Math.floor((containerWidth - 2 * PADDING + GAP) / (width + GAP)),
    ),
  );
  let edit = $derived(viewer.mode === "bulk");
</script>

<div class="pages" bind:clientWidth={containerWidth}>
  {#if browser}
    <VMasonry
      getKey={({ id }) => id}
      {lanes}
      data={pages}
      gap={GAP}
      style="padding: {PADDING}px"
    >
      {#snippet children(
        { id, oneIndexedPageNumber, aspectRatio, rotation },
        n,
      )}
        {@const page_number = n + 1}
        {@const height = width / aspectRatio}
        {@const margin = lanes > 1 ? maxHeight - height : 0}
        <!-- Modifications reorder pages, so the image comes from the source page, not the slot. -->
        {@const src = pageImageUrl(document, oneIndexedPageNumber, size).href}
        {@const title = `Page ${oneIndexedPageNumber}, ${document.title}`}
        <div class="page-container">
          <Page pageId={id} {page_number}>
            {#snippet children({ documentHref, selected })}
              {#if edit}
                {@const quarterTurn = Math.abs(rotation / 90) % 2 === 1}
                <div
                  class="edit-image"
                  style:--rotation="{rotation}deg"
                  style:width="{width}px"
                  style:height="{height}px"
                  style:margin-bottom="{margin}px"
                >
                  <img
                    class:selected
                    {src}
                    alt={title}
                    {title}
                    width={quarterTurn ? height : width}
                    height={quarterTurn ? width : height}
                    loading="lazy"
                  />
                </div>
              {:else}
                <a href={documentHref} style:margin-bottom="{margin}px">
                  <img
                    {src}
                    alt={title}
                    {title}
                    {width}
                    {height}
                    loading="lazy"
                  />
                </a>
              {/if}
            {/snippet}
          </Page>
        </div>
      {/snippet}
    </VMasonry>
  {/if}
</div>

<style>
  .pages {
    height: 100%;
  }

  .page-container {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 100%;
    width: 100%;
  }

  a:hover {
    text-decoration: underline;
  }

  img {
    background-color: var(--white, white);
    box-shadow: var(--shadow-1);
  }

  .selected {
    outline: 2px solid var(--blue-3);
  }

  .edit-image {
    position: relative;
  }

  .edit-image img {
    position: absolute;
    top: 50%;
    left: 50%;
    max-width: none;
    transform: translate(-50%, -50%) rotate(var(--rotation));
  }
</style>
