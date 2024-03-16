<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Hourglass24 } from "svelte-octicons";
  import { page } from "$app/stores";

  import ResultsList from "$lib/components/documents/ResultsList.svelte";
  import ContentLayout from "$lib/components/ContentLayout.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import Search from "$lib/components/Search.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import Paginator from "@/common/Paginator.svelte";

  let page_number = 1;
  let per_page = 25;
  let error: Error;

  $: searchResults = $page.data.searchResults;
  $: query = $page.data.query;

  async function load(url) {
    const res = await fetch(url, { credentials: "include" }).catch((e) => {
      error = e;
      throw e; // if something went wrong here, something broke
    });

    if (!res.ok) {
      // 404 or something similar
      console.error(res.statusText);
      error = { name: "Loading error", message: res.statusText };
    }

    $page.data.searchResults = res.json();
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
            page_number = Math.min(total_pages, page_number + 1);
            load(next);
          }}
          on:previous={(e) => {
            page_number = Math.max(1, page_number - 1);
            load(previous);
          }}
        />
      {/await}
    </svelte:fragment>

    <label slot="right">
      Per page
      <select name="per_page" bind:value={per_page}>
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
    </label>
  </PageToolbar>
</ContentLayout>
