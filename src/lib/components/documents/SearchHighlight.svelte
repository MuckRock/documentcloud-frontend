<script lang="ts">
  import type { Document, Highlight } from "$lib/api/types";
  import { pageUrl } from "$lib/api/documents";

  /*
  {
  "page_no_1": [
      ". - Suite 1402 West Tower - Atlanta, GA 30334\nEffective as of\n\n01/31/2016\n\nSherry <em>Boston</em>\nP.O. "
    ]
  }
  */
  export let highlight: Highlight;
  export let document: Document;

  const PAGE_NO_RE = /^page_no_(\d+)$/;

  function pageLink(page: string): [number, string] {
    const match = PAGE_NO_RE.exec(page);
    if (!match) return [NaN, ""];

    const number = +match[1];
    return [number, pageUrl(document, number).toString()];
  }
</script>

{#each Object.entries(highlight) as [page, segments]}
  {@const [number, href] = pageLink(page)}
  <h4><a {href}>Page {number}</a></h4>
  <blockquote class="highlight">
    {#each segments as segment}
      <p class="segment">{@html segment}</p>
    {/each}
  </blockquote>
{/each}

<style>
  .segment :global(em) {
    background-color: var(--yellow);
  }
</style>
