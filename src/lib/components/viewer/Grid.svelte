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
  import { pageSizesFromSpec } from "$lib/utils/pageSize";
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

  let sizes = $derived(pageSizesFromSpec(document.page_spec));
  let scale = $derived(SCALE[size] ?? 1);
  let width = $derived((IMAGE_WIDTHS_MAP.get(size) ?? 180) / scale);
  let maxHeight = $derived(width * Math.max(...sizes));
  let lanes = $derived(
    Math.max(
      1,
      Math.floor((containerWidth - 2 * PADDING + GAP) / (width + GAP)),
    ),
  );
</script>

<div class="pages" bind:clientWidth={containerWidth}>
  {#if browser}
    <VMasonry {lanes} data={sizes} gap={GAP} style="padding: {PADDING}px">
      {#snippet children(aspect, n)}
        {@const page_number = n + 1}
        {@const height = width * aspect}
        {@const margin = lanes > 1 ? maxHeight - height : 0}
        {@const src = pageImageUrl(document, page_number, size).href}
        <div class="page-container">
          <Page {page_number}>
            {#snippet children({ documentHref })}
              <a href={documentHref} style:margin-bottom="{margin}px">
                <img
                  {src}
                  alt="Page {page_number}, {document.title}"
                  title="Page {page_number}, {document.title}"
                  width="{width}px"
                  height="{height}px"
                  loading="lazy"
                />
              </a>
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
</style>
