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
  import { run } from "svelte/legacy";

  import type { Writable } from "svelte/store";
  import type { Document } from "$lib/api/types";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";

  import Highlight from "./Highlight.svelte";
  import HighlightGroup from "./HighlightGroup.svelte";

  import { pageUrl } from "$lib/api/documents";
  import { pageNumber } from "$lib/utils/search";

  interface Props {
    document: Document;
    open?: boolean;
  }

  let { document, open = $bindable(true) }: Props = $props();

  const { subscribe } =
    getContext<Writable<{ allOpen: boolean }>>("highlightState") ?? {};
  run(() => {
    subscribe?.((state) => {
      open = state.allOpen;
    });
  });
  let highlights = $derived(Object.entries(document.highlights ?? {}));

  function pageHref(id: string): string {
    const pageNo = pageNumber(id);
    return pageUrl(document, pageNo).href;
  }
</script>

<HighlightGroup
  {highlights}
  getHref={pageHref}
  bind:open
  showAll={Boolean(subscribe)}
  on:collapseAll
  on:expandAll
>
  {#snippet summary()}
    {$_("documents.matchingPages", { values: { n: highlights.length } })}
  {/snippet}
  {#snippet children({ id, highlight })}
    <Highlight
      title="{$_('documents.pageAbbrev')} {pageNumber(id)}"
      inlineTitle
      segments={highlight}
    />
  {/snippet}
</HighlightGroup>
