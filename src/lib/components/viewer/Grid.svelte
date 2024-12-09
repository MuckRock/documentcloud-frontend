<!--
  @component
  Show a grid of thumbnail images for a single document.
  Each image should link to its respective page.

  Assumes it's a child of a ViewerContext.

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
  import {
    getDocument,
    getZoom,
  } from "$lib/components/viewer/ViewerContext.svelte";
  import { zoomToSize } from "@/lib/utils/viewer";

  export let size: Sizes = "thumbnail";

  const documentStore = getDocument();
  const zoom = getZoom();

  const SCALE = {
    thumbnail: 1,
    small: 1,
    normal: 3,
    large: 3,
  };

  $: document = $documentStore;
  $: size = zoomToSize($zoom);
  $: sizes = pageSizesFromSpec(document.page_spec);
  $: scale = SCALE[size] ?? 1;
  $: width = (IMAGE_WIDTHS_MAP.get(size) ?? 180) / scale;
</script>

<div class="pages" style:--image-width="{width}px">
  {#if browser}
    {#each sizes as aspect, n}
      {@const page_number = n + 1}
      {@const height = width * aspect}
      {@const src = pageImageUrl(document, page_number, size).href}
      <Page {page_number} let:documentHref>
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
