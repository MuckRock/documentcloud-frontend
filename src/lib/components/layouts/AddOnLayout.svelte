<script lang="ts">
  import { setContext } from "svelte";
  import { Hourglass24 } from "svelte-octicons";
  import { _ } from "svelte-i18n";
  import type { AddOnListItem, Event } from "@/addons/types";
  import type { DocumentResults } from "$lib/api/types";
  import Selection from "$lib/components/inputs/Selection.svelte";
  import AddOnDispatch, { values } from "../forms/AddOnDispatch.svelte";
  import AddOnMeta from "../addons/AddOnMeta.svelte";
  import ContentLayout from "./ContentLayout.svelte";
  import PageToolbar from "../common/PageToolbar.svelte";
  import Search from "../forms/Search.svelte";
  import ResultsList, {
    selected,
    total,
    visible,
  } from "../documents/ResultsList.svelte";
  import Empty from "../common/Empty.svelte";
  import Flex from "../common/Flex.svelte";

  export let addon: AddOnListItem;
  export let event: Event | null = null;
  export let search: Promise<DocumentResults>;
  export let query: string;
  export let disablePremium: boolean = false;

  setContext("selected", selected);

  $: action = event
    ? `/add-ons/${addon.repository}/${event.id}/?/update`
    : `/add-ons/${addon.repository}/?/dispatch`;

  function selectAll(e) {
    if (e.target.checked) {
      $selected = [...$visible];
    } else {
      $selected = [];
    }
  }
</script>

<div class="container">
  <section class="addon">
    <header><AddOnMeta {addon} /></header>
    <main>
      <!-- TODO: Tabs to view add-on dispatch, history and schedule -->>
      <AddOnDispatch
        {action}
        {event}
        properties={addon.parameters.properties}
        required={addon.parameters.required}
        eventOptions={addon.parameters.eventOptions}
      >
        <svelte:fragment slot="selection">
          {#await search then results}
            <Selection
              bind:value={$values["selection"]}
              documents={new Set(addon.parameters.documents)}
              resultsCount={results.count}
              {query}
            />
          {/await}
        </svelte:fragment>
      </AddOnDispatch>
    </main>
  </section>
  {#if addon.parameters.documents}
    <div class="docs">
      <ContentLayout>
        <PageToolbar slot="header">
          <Search name="q" {query} slot="center" />
        </PageToolbar>
        <svelte:fragment>
          {#await search}
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
    </div>
  {/if}
</div>

<style>
  .container {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 1rem;
    gap: 1rem;
  }
  .addon,
  .docs {
    flex: 1 1 50%;
    max-width: 48rem;
    overflow-y: auto;
  }
  .addon {
    height: min-content;
    max-height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: visible;
  }
  .addon main {
    overflow-y: auto;
    background-color: var(--white);
    border: 1px solid var(--gray-1);
    border-radius: 1rem;
    box-shadow: var(--shadow-1);
  }
  .docs {
    background-color: var(--gray-1);
    border: 1px solid var(--gray-2);
    border-radius: 1rem;
  }
</style>
