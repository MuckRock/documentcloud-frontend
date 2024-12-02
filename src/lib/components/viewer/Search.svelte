<!-- @component
Assumes it's a child of a ViewerContext
 -->

<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Hourglass24, Search24 } from "svelte-octicons";

  import { page } from "$app/stores";

  import Empty from "../common/Empty.svelte";

  import { getQuery, highlight, pageNumber } from "$lib/utils/search";
  import { getViewerHref } from "$lib/utils/viewer";
  import Highlight from "../common/Highlight.svelte";
  import type { APIResponse, Highlights } from "@/lib/api/types";
  import { getDocument } from "./ViewerContext.svelte";
  import { searchWithin } from "@/lib/api/documents";
  import Error from "../common/Error.svelte";

  const document = getDocument();
  let query = getQuery($page.url, "q");

  // Format page numbers, highlight search results, and remove invalid pages
  function formatResults(results: APIResponse<Highlights>) {
    if (results.error) throw new TypeError(results.error.message);
    if (!results || !results.data)
      throw new TypeError("Failed to get search results");
    return Object.entries(results?.data ?? {})
      .map<[number, string[]]>(([page, results]) => [
        pageNumber(page),
        results.map((result) => highlight(result, query)),
      ])
      .filter(([page]) => !isNaN(page));
  }

  let search: Promise<[number, string[]][]>;
  $: search = searchWithin($document.id, query).then(formatResults);
</script>

<div class="pages">
  {#await search}
    <Empty icon={Hourglass24}>
      {$_("search.loading")}
    </Empty>
  {:then resultsPages}
    {#each resultsPages as [pageNumber, resultsList]}
      <a
        href={getViewerHref({ page: pageNumber, mode: "document", query })}
        class="card"
      >
        <Highlight
          title="{$_('documents.pageAbbrev')} {pageNumber}"
          segments={resultsList}
        />
      </a>
    {:else}
      <Empty icon={Search24}>
        {$_("search.empty")}
      </Empty>
    {/each}
  {:catch err}
    <Error>{err.message}</Error>
  {/await}
</div>

<style>
  .pages {
    display: flex;
    flex-flow: column;
    align-items: center;
    gap: 2rem;
    margin: 0 auto;
    max-width: 38.0625rem;
    padding: 2rem 0;
    min-height: 100%;
  }
  h2 {
    font-weight: var(--font-semibold);
  }
  .card {
    color: inherit;
    text-decoration: none;
    border: 1px solid var(--gray-2);
    border-radius: 0.25rem;
    box-shadow: var(--shadow-1);
  }
  .card:hover,
  .card:focus {
    border-color: var(--blue-2);
    background-color: var(--blue-1);
  }
</style>
