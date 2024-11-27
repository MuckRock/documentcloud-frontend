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

  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";
  import { _ } from "svelte-i18n";

  import Highlight from "../common/Highlight.svelte";
  import HighlightGroup from "../common/HighlightGroup.svelte";

  import { pageUrl } from "$lib/api/documents";
  import { pageNumber } from "$lib/utils/search";

  export let document: Document;
  export let open = true;

  const { subscribe } =
    getContext<Writable<{ allOpen: boolean }>>("highlightState");
  $: subscribe((state) => {
    open = state.allOpen;
  });
  $: highlights = Object.entries(document.highlights ?? {});

  function pageHref(id: string): string {
    const pageNo = pageNumber(id);
    return pageUrl(document, pageNo).toString();
  }
</script>

<HighlightGroup
  {highlights}
  getHref={pageHref}
  bind:open
  on:collapseAll
  on:expandAll
>
  <svelte:fragment slot="summary">
    {$_("documents.matchingPages", { values: { n: highlights.length } })}
  </svelte:fragment>
  <svelte:fragment let:id let:highlight>
    <Highlight
      title="{$_('documents.pageAbbrev')} {pageNumber(id)}"
      inlineTitle
      segments={highlight}
    />
  </svelte:fragment>
</HighlightGroup>
