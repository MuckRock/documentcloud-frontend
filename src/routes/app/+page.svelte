<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Hourglass24 } from "svelte-octicons";
  import ResultsList from "$lib/components/documents/ResultsList.svelte";
  import ContentLayout from "$lib/components/ContentLayout.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import Search from "$lib/components/Search.svelte";
  import Empty from "$lib/components/common/Empty.svelte";

  export let data;

  $: searchResults = data.searchResults;
  $: query = data.query;
</script>

<ContentLayout>
  <PageToolbar slot="header">
    <Search {query} slot="center" />
  </PageToolbar>
  {#await searchResults}
    <Empty icon={Hourglass24}>Loading…</Empty>
  {:then results}
    <ResultsList
      results={results.results}
      count={results.count}
      next={results.next}
    />
  {/await}

  <PageToolbar slot="footer">
    <label slot="left">
      <input type="checkbox" name="select_all" />
      Select all
    </label>
  </PageToolbar>
</ContentLayout>
