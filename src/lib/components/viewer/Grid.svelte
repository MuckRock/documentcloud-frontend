<!--
  @component
  Show a grid of thumbnail images for a single document.
  Each image should link to its respective page.

  Assumes it's a child of a ViewerContext
-->
<script lang="ts">
  import type { Sizes } from "$lib/api/types";

  import { _ } from "svelte-i18n";

  import Page from "./Page.svelte";

  import { IMAGE_WIDTHS_MAP } from "@/config/config.js";
  import { pageImageUrl } from "$lib/api/documents";
  import { pageSizesFromSpec } from "@/api/pageSize.js";
  import { getDocument } from "$lib/components/viewer/ViewerContext.svelte";

  export let size: Sizes = "thumbnail";

  const document = getDocument();

  const SCALE = {
    thumbnail: 1,
    small: 1,
    normal: 3,
    large: 3,
  };

  $: sizes = pageSizesFromSpec(document.page_spec);
  $: scale = SCALE[size] ?? 1;
  $: width = IMAGE_WIDTHS_MAP.get(size) / scale;
</script>

<div class="pages" style:--image-width="{width}px">
  {#each sizes as aspect, n}
    {@const page_number = n + 1}
    {@const height = width * aspect}
    <Page {page_number} let:href>
      <a {href}>
        <img
          src={pageImageUrl(document, page_number, size).href}
          alt="Page {page_number}, {document.title}"
          title="Page {page_number}, {document.title}"
          width="{width}px"
          height="{height}px"
          loading="lazy"
        />
      </a>
    </Page>
  {/each}
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
