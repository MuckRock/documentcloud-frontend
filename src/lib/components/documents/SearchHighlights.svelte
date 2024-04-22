<!--
  @component
  Highlights from search results in document text.
  A highlight looks like this:
  ```json
  {
  "page_no_1": [
      ". - Suite 1402 West Tower - Atlanta, GA 30334\nEffective as of\n\n01/31/2016\n\nSherry <em>Boston</em>\nP.O. "
    ]
  }
  ```
-->

<script lang="ts">
  import type { Document } from "$lib/api/types";

  import DOMPurify from "isomorphic-dompurify";
  import { _ } from "svelte-i18n";

  import { pageUrl } from "$lib/api/documents";

  export let document: Document;
  export let open = false;

  const PAGE_NO_RE = /^page_no_(\d+)$/;

  $: highlights = document.highlights;
  $: count = Object.keys(highlights).length;

  function pageLink(page: string): [number, string] {
    const match = PAGE_NO_RE.exec(page);
    if (!match) return [NaN, ""];

    const number = +match[1];
    return [number, pageUrl(document, number).toString()];
  }

  function sanitize(s: string): string {
    return DOMPurify.sanitize(s, { ALLOWED_TAGS: ["em"] });
  }
</script>

{#if count}
  <details class="highlights" bind:open>
    <summary>{$_("documents.matchingPages", { values: { n: count } })}</summary>

    {#each Object.entries(highlights) as [page, segments]}
      {@const [number, href] = pageLink(page)}
      <h4><a {href}>{$_("documents.page")} {number}</a></h4>
      <blockquote class="highlight">
        {#each segments as segment}
          <p class="segment">{@html sanitize(segment)}</p>
        {/each}
      </blockquote>
    {/each}
  </details>
{/if}

<style>
  .segment :global(em) {
    background-color: var(--yellow-bright);
    font-style: normal;
  }
</style>
