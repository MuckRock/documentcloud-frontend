<script lang="ts">
  import type { DocumentResults } from "$lib/api/types";

  import { setContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { Hourglass24, PlusCircle16 } from "svelte-octicons";

  import Actions from "../documents/sidebar/Actions.svelte";
  import AddOns from "../documents/sidebar/AddOns.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import BulkActions from "$lib/components/forms/BulkActions.svelte";
  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import Documents from "../documents/sidebar/Documents.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import SidebarLayout from "$lib/components/layouts/SidebarLayout.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import Pending from "$lib/components/documents/Pending.svelte";
  import Projects from "../documents/sidebar/Projects.svelte";
  import ResultsList, {
    selected,
    total,
    visible,
  } from "$lib/components/documents/ResultsList.svelte";
  import Search from "@/lib/components/forms/Search.svelte";
  import SignedIn from "$lib/components/common/SignedIn.svelte";

  import { deleted } from "$lib/api/documents";

  export let data;

  setContext("selected", selected);

  $: searchResults =
    $deleted.size > 0
      ? data.searchResults.then((r) => excludeDeleted(r, $deleted))
      : data.searchResults;
  $: query = data.query;
  $: pending = data.pending;

  function selectAll(e) {
    if (e.target.checked) {
      $selected = [...$visible];
    } else {
      $selected = [];
    }
  }

  // filter out deleted documents that haven't been purged from search yet
  function excludeDeleted(
    searchResults: DocumentResults,
    deleted: Set<string>,
  ): DocumentResults {
    const filtered = searchResults.results.filter(
      (d) => !deleted.has(String(d.id)),
    );

    return {
      ...searchResults,
      results: filtered,
      count: searchResults.count - deleted.size,
    };
  }
</script>

<SidebarLayout>
  <svelte:fragment slot="navigation">
    <Documents />
    <SignedIn>
      <Projects />
    </SignedIn>
  </svelte:fragment>

  <svelte:fragment slot="content">
    <ContentLayout>
      <PageToolbar slot="header">
        <BulkActions slot="left" />
        <Search name="q" {query} slot="right" />
      </PageToolbar>
      {#await searchResults}
        <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
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
        <label class="select-all" slot="left">
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

  <svelte:fragment slot="action">
    <SignedIn>
      <Button mode="primary" href="/upload/"
        ><PlusCircle16 />{$_("sidebar.upload")}</Button
      >
      <Actions />
      <AddOns pinnedAddOns={data.pinnedAddons} />
    </SignedIn>
  </svelte:fragment>
</SidebarLayout>

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
