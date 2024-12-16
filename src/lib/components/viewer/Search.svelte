<!-- @component
Assumes it's a child of a ViewerContext
 -->

<script lang="ts">
  import type { APIResponse, Highlights } from "$lib/api/types";

  import { page } from "$app/stores";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { Hourglass24, Search24 } from "svelte-octicons";

  import Empty from "../common/Empty.svelte";
  import Error from "../common/Error.svelte";
  import Highlight from "../common/Highlight.svelte";

  import { getDocument } from "./ViewerContext.svelte";
  import { getQuery, highlight, pageNumber } from "$lib/utils/search";
  import { getViewerHref } from "$lib/utils/viewer";
  import { qs } from "$lib/utils/navigation";
  import { searchWithin } from "$lib/api/documents";

  const document = getDocument();
  const embed: boolean = getContext("embed");

  let search: Promise<[number, string[]][]>;

  $: query = getQuery($page.url, "q");
  $: search = searchWithin($document.id, query).then(formatResults);

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

  function countResults(results: [number, string[]][]) {
    return results.reduce((acc, [, segments]) => acc + segments.length, 0);
  }
</script>

<div class="pages">
  {#await search}
    <Empty icon={Hourglass24}>
      {$_("search.loading")}
    </Empty>
  {:then resultsPages}
    {#if resultsPages.length > 0}
      <header>
        <h2>
          {$_("search.viewerResults", {
            values: {
              results: countResults(resultsPages),
              pages: resultsPages.length,
            },
          })}
        </h2>
      </header>
    {/if}
    {#each resultsPages as [pageNumber, resultsList]}
      {@const href = getViewerHref({
        document: $document,
        page: pageNumber,
        mode: "document",
        query,
      })}

      <a use:qs {href} class="card">
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
    gap: 1rem;
    margin: 0 auto;
    width: 100%;
    max-width: 38.0625rem;
    padding: 1rem 1rem;
    min-height: 100%;
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
  header {
    margin-bottom: 1rem;
  }
  h2 {
    font-size: var(--font-lg);
    font-weight: var(--font-semibold);
    color: var(--gray-5);
  }
</style>
