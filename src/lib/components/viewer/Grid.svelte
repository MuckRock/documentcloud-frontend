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

  let document = $derived(viewer.document!);
  $effect(() => {
    size = zoomToSize(viewer.zoom);
  });
  let sizes = $derived(pageSizesFromSpec(document.page_spec));
  let scale = $derived(SCALE[size] ?? 1);
  let width = $derived((IMAGE_WIDTHS_MAP.get(size) ?? 180) / scale);
</script>

<div class="pages" style:--image-width="{width}px">
  {#if browser}
    {#each sizes as aspect, n}
      {@const page_number = n + 1}
      {@const height = width * aspect}
      {@const src = pageImageUrl(document, page_number, size).href}
      <Page {page_number}>
        {#snippet children({ documentHref })}
          <a href={documentHref}>
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
    {/each}
  {/if}
</div>

<style>
  .pages {
    display: grid;
    grid-template-columns: repeat(auto-fill, var(--image-width));
    gap: 1.5rem;
    padding: 2rem;
    justify-content: space-evenly;
  }

  a:hover {
    text-decoration: underline;
  }

  img {
    background-color: var(--white, white);
    box-shadow: var(--shadow-1);
  }
</style>
