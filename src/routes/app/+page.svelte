<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Hourglass24 } from "svelte-octicons";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  import ResultsList from "$lib/components/documents/ResultsList.svelte";
  import ContentLayout from "$lib/components/ContentLayout.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import Search from "$lib/components/Search.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import Paginator from "@/common/Paginator.svelte";

  export let data;

  let page_number = 1;

  $: searchResults = data.searchResults;
  $: query = data.query;
  $: per_page = data.per_page;
  $: page_number = data.page;

  // update the cursor URL param, forcing refresh of search results
  function setCursor(url: URL) {
    const cursor = url.searchParams.get("cursor");
    const page_number = url.searchParams.get("page");

    // handle different environments that paginate differently
    if (cursor) $page.url.searchParams.set("cursor", cursor);
    if (per_page) $page.url.searchParams.set("page", page_number);

    return goto($page.url);
  }

  // update the per_page query param
  function setPerPage(e) {
    $page.url.searchParams.set("per_page", e.target.value);
    return goto($page.url);
  }
</script>

<ContentLayout>
  <PageToolbar slot="header">
    <Search {query} slot="center" />
  </PageToolbar>
  {#await searchResults}
    <Empty icon={Hourglass24}>Loading…</Empty>
  {:then results}
    <ResultsList {results} />
  {/await}

  <PageToolbar slot="footer">
    <label slot="left">
      <input type="checkbox" name="select_all" />
      Select all
    </label>

    <svelte:fragment slot="center">
      {#await searchResults then sr}
        {@const count = sr.count}
        {@const total_pages = Math.ceil(count / per_page)}
        {@const next = sr.next}
        {@const previous = sr.previous}

        <Paginator
          page={page_number}
          totalPages={total_pages}
          has_next={Boolean(next)}
          has_previous={Boolean(previous)}
          on:next={(e) => {
            if (next) setCursor(new URL(next));
            page_number = Math.min(total_pages, page_number + 1);
          }}
          on:previous={(e) => {
            if (previous) setCursor(new URL(previous));
            page_number = Math.max(1, page_number - 1);
          }}
        />
      {/await}
    </svelte:fragment>

    <label slot="right">
      Per page
      <select name="per_page" value={per_page} on:change={setPerPage}>
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
    </label>
  </PageToolbar>
</ContentLayout>
