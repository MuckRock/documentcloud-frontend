<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Hourglass24, PlusCircle16 } from "svelte-octicons";

  import Pending from "$lib/components/documents/Pending.svelte";
  import ResultsList, {
    selected,
    total,
    visible,
  } from "$lib/components/documents/ResultsList.svelte";
  import MainLayout from "$lib/components/layouts/MainLayout.svelte";
  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import Search from "$lib/components/inputs/Search.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import SignedIn from "$lib/components/common/SignedIn.svelte";
  import Actions from "./sidebar/Actions.svelte";
  import AddOns from "./sidebar/AddOns.svelte";
  import Documents from "./sidebar/Documents.svelte";
  import Projects from "./sidebar/Projects.svelte";

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

<MainLayout>
  <svelte:fragment slot="navigation">
    <Documents />
    <SignedIn>
      <Projects />
    </SignedIn>
  </svelte:fragment>

  <svelte:fragment slot="content">
    <ContentLayout>
      <PageToolbar slot="header">
        <Search name="q" {query} slot="center" />
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
          <svelte:fragment slot="start">
            {#await pending then p}
              <Pending pending={p} />
            {/await}
          </svelte:fragment>
        </ResultsList>
      {/await}

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
            {$selected.length.toLocaleString()} selected
          {:else}
            Select all
          {/if}
        </label>

        <svelte:fragment slot="right">
          {#if $visible && $total}
            Showing {$visible.size.toLocaleString()} of {$total.toLocaleString()}
            results
          {/if}
        </svelte:fragment>
      </PageToolbar>
    </ContentLayout>
  </svelte:fragment>

  <svelte:fragment slot="action">
    <SignedIn>
      <Button mode="primary" href="/app/upload/"
        ><PlusCircle16 /> Upload Documents</Button
      >
      <Actions />
      <AddOns pinnedAddOns={data.pinnedAddons} />
    </SignedIn>
  </svelte:fragment>
</MainLayout>

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
