<script lang="ts">
  import type { DocumentResults, Maybe } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Hourglass24, SidebarExpand16 } from "svelte-octicons";

  import Flex from "../common/Flex.svelte";
  import Empty from "../common/Empty.svelte";
  import Button from "../common/Button.svelte";
  import PageToolbar from "../toolbars/PageToolbar.svelte";
  import ResultsList from "../documents/ResultsList.svelte";
  import Search from "../forms/Search.svelte";
  import ContentLayout from "../layouts/ContentLayout.svelte";

  import { sidebars } from "../layouts/Sidebar.svelte";
  import { remToPx } from "$lib/utils/layout";
  import { getSearchResults } from "$lib/state/search.svelte";

  interface Props {
    search: Promise<Maybe<DocumentResults>>;
    query: string;
  }

  let { search, query }: Props = $props();

  const searchState = getSearchResults();

  function selectAll(e) {
    if (e.target.checked) {
      searchState.selectAll();
    } else {
      searchState.deselectAll();
    }
  }

  let clientWidth: number = $state(800);
</script>

<div bind:clientWidth class="outer">
  <ContentLayout>
    {#snippet header()}
      <Flex>
        {#if $sidebars["navigation"] === false && clientWidth > remToPx(30)}
          <div class="toolbar w-auto">
            <Button
              ghost
              minW={false}
              on:click={() => ($sidebars["navigation"] = true)}
            >
              <span class="flipV">
                <SidebarExpand16 />
              </span>
            </Button>
          </div>
        {/if}
        <PageToolbar>
          {#snippet center()}
            <Search name="q" {query} />
          {/snippet}
        </PageToolbar>
      </Flex>
    {/snippet}

    {#await search}
      <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
    {:then search}
      <ResultsList
        results={search?.results}
        next={search?.next}
        count={search?.count}
        auto
      />
    {/await}

    {#snippet footer()}
      <PageToolbar>
        {#snippet left()}
          <label class="select-all">
            <input
              type="checkbox"
              name="select_all"
              checked={searchState.selected.length === searchState.visible.size}
              indeterminate={searchState.selected.length > 0 &&
                searchState.selected.length < searchState.visible.size}
              onchange={selectAll}
            />
            {#if searchState.selected.length > 0}
              {searchState.selected.length.toLocaleString()} {$_("inputs.selected")}
            {:else}
              {$_("inputs.selectAll")}
            {/if}
          </label>
        {/snippet}
        {#snippet right()}
          {#if searchState.visible && searchState.total}
            {$_("inputs.resultsCount", {
              values: { n: searchState.visible.size, total: searchState.total },
            })}
          {/if}
        {/snippet}
      </PageToolbar>
    {/snippet}
  </ContentLayout>
</div>

<style>
  .outer {
    height: 100%;
  }
</style>
