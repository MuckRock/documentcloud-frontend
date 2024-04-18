<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Hourglass24 } from "svelte-octicons";

  import Pending from "$lib/components/documents/Pending.svelte";
  import ResultsList, {
    selected,
    total,
    visible,
  } from "$lib/components/documents/ResultsList.svelte";
  import ContentLayout from "$lib/components/ContentLayout.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import Search from "$lib/components/Search.svelte";
  import Empty from "$lib/components/common/Empty.svelte";

  export let data;

  $: searchResults = data.searchResults;
  $: query = data.query;
  $: pending = data.pending;

  function selectAll(e) {
    if (e.target.checked) {
      $selected = [...$visible];
    } else {
      $selected = [];
    }
  }
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
      auto
    >
      {#await pending then p}
        <Pending pending={p} />
      {/await}
    </ResultsList>
  {/await}

  <PageToolbar slot="footer">
    <label slot="left" class="select-all">
      <input
        type="checkbox"
        name="select_all"
        checked={$selected.length > 0 && $selected.length === $visible.size}
        indeterminate={$selected.length > 0 && $selected.length < $visible.size}
        on:change={selectAll}
      />
      {#if $selected.length > 0}
        {$selected.length.toLocaleString()} selected
      {:else}
        Select all
      {/if}
    </label>

    <svelte:fragment slot="right">
      {#if $visible && $total}
        Showing {$visible.size.toLocaleString()} of {$total.toLocaleString()} results
      {/if}
    </svelte:fragment>
  </PageToolbar>
</ContentLayout>

<style>
  label.select-all {
    align-items: center;
    align-self: stretch;
    display: flex;
    gap: 0.5rem;
  }

  input[type="checkbox"] {
    height: 1.25rem;
    width: 1.25rem;
  }
</style>
