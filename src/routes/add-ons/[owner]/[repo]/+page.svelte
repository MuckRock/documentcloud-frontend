<script lang="ts">
  import { setContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { Hourglass24 } from "svelte-octicons";

  import AddOnDispatch, {
    values,
  } from "$lib/components/forms/AddOnDispatch.svelte";
  import AddOnMeta from "$lib/components/addons/AddOnMeta.svelte";
  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import MainLayout from "$lib/components/layouts/MainLayout.svelte";
  import ResultsList, {
    selected,
    total,
    visible,
  } from "$lib/components/documents/ResultsList.svelte";
  import Search from "$lib/components/forms/Search.svelte";
  import Selection from "$lib/components/inputs/Selection.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";

  export let data;

  setContext("selected", selected);

  $: addon = data.addon;
  $: query = data.query;
  $: searchResults = data.searchResults;

  function selectAll(e) {
    if (e.target.checked) {
      $selected = [...$visible];
    } else {
      $selected = [];
    }
  }
</script>

<svelte:head>
  <title>{addon.name} | Add-Ons | DocumentCloud</title>
</svelte:head>

<MainLayout>
  <AddOnMeta {addon} slot="navigation" />
  <svelte:fragment slot="content">
    <div class="card">
      <AddOnDispatch
        properties={addon.parameters.properties}
        required={addon.parameters.required}
        eventOptions={addon.parameters.eventOptions}
      >
        <svelte:fragment slot="selection">
          {#await searchResults then results}
            <Selection
              bind:value={$values["selection"]}
              documents={new Set(addon.parameters.documents)}
              resultsCount={results.count}
            />
          {/await}
        </svelte:fragment>
      </AddOnDispatch>
    </div>

    <ContentLayout>
      <PageToolbar slot="header">
        <Search name="q" {query} slot="center" />
      </PageToolbar>
      <svelte:fragment>
        {#await searchResults}
          <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
        {:then search}
          <ResultsList
            results={search.results}
            next={search.next}
            count={search.count}
            auto
          />
        {/await}
      </svelte:fragment>

      <PageToolbar slot="footer">
        <label slot="left" class="select-all">
          <input
            type="checkbox"
            name="select_all"
            checked={$selected.length === $visible.size}
            indeterminate={$selected.length > 0 &&
              $selected.length < $visible.size}
            on:change={selectAll}
          />
          {#if $selected.length > 0}
            {$selected.length.toLocaleString()} {$_("inputs.selected")}
          {:else}
            {$_("inputs.selectAll")}
          {/if}
        </label>

        <svelte:fragment slot="right">
          {#if $visible && $total}
            {$_("inputs.resultsCount", {
              values: { n: $visible.size, total: $total },
            })}
          {/if}
        </svelte:fragment>
      </PageToolbar>
    </ContentLayout>
  </svelte:fragment>
</MainLayout>

<style>
  .card {
    margin: 0.75rem;
    padding: 0.75rem;
  }
</style>
