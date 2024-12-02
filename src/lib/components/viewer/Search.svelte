<!-- @component
Assumes it's a child of a ViewerContext
 -->

<script lang="ts">
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import { Search24 } from "svelte-octicons";

  import { page } from "$app/stores";

  import Empty from "../common/Empty.svelte";

  import {
    getCurrentPage,
    getSearch,
  } from "$lib/components/viewer/ViewerContext.svelte";
  import { getQuery, highlight, pageNumber } from "$lib/utils/search";
  import { scrollToPage } from "$lib/utils/scroll";
  import { getViewerHref } from "$lib/utils/viewer";
  import Highlight from "../common/Highlight.svelte";

  const search = getSearch();
  const currentPage = getCurrentPage();
  let query = getQuery($page.url, "q");

  // Format page numbers, highlight search results, and remove invalid pages
  $: resultsPages = Object.entries(search?.data ?? {})
    .map<[number, string[]]>(([page, results]) => [
      pageNumber(page),
      results.map((result) => highlight(result, query)),
    ])
    .filter(([page]) => !isNaN(page));

  onMount(async () => {
    if ($currentPage > 1) {
      scrollToPage($currentPage);
    }
  });
</script>

<div class="pages">
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
      <h2>{$_("search.empty")}</h2>
    </Empty>
  {/each}
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
