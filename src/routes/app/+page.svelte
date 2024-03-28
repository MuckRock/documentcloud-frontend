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

  $: searchResults = data.searchResults;
  $: query = data.query;
  $: per_page = data.per_page;
  $: current = data.cursor;
  // $: page_number = data.page;

  // update the cursor URL param, forcing refresh of search results
  function setCursor(next: string, previous: string) {
    // snapshot the current URL
    const u = new URL($page.url);

    u.searchParams.set("cursor", next);

    // we need to store the current cursor in the URL so we can go back
    if (previous) {
      u.searchParams.set("previous", current);
    } else {
      u.searchParams.delete("previous");
    }

    return goto(u);
  }

  // update the per_page query param
  async function setPerPage(e) {
    const u = new URL($page.url);
    u.searchParams.set("per_page", e.target.value);
    return goto(u);
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

        <Paginator
          totalPages={total_pages}
          has_next={Boolean(next)}
          has_previous={Boolean(current)}
          on:next={async (e) => {
            const cursor = new URL(next).searchParams.get("cursor");
            await setCursor(cursor, current);
            // page_number = Math.min(total_pages, page_number + 1);
          }}
          on:previous={async (e) => {
            await setCursor(current, "");
            // page_number = Math.max(1, page_number - 1);
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
