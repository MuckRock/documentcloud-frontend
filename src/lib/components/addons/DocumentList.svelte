<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Hourglass24, SidebarExpand16 } from "svelte-octicons";

  import { page } from "$app/state";
  import { goto } from "$app/navigation";

  import Flex from "../common/Flex.svelte";
  import Empty from "../common/Empty.svelte";
  import Button from "../common/Button.svelte";
  import PageToolbar from "../toolbars/PageToolbar.svelte";
  import ResultsList from "../documents/ResultsList.svelte";
  import SearchEditor from "../documents/search/SearchEditor.svelte";
  import ContentLayout from "../layouts/ContentLayout.svelte";

  import { sidebars } from "../layouts/Sidebar.svelte";
  import { remToPx } from "$lib/utils/layout";
  import { getSearchResults } from "$lib/state/search.svelte";

  interface Props {
    query: string;
  }

  let { query }: Props = $props();

  const searchState = getSearchResults();

  function handleSearchSubmit(detail: { q: string }) {
    const url = new URL(page.url);
    url.searchParams.set("q", detail.q);
    goto(url);
  }

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
              onclick={() => ($sidebars["navigation"] = true)}
            >
              <span class="flipV">
                <SidebarExpand16 />
              </span>
            </Button>
          </div>
        {/if}
        <PageToolbar>
          {#snippet center()}
            <SearchEditor {query} onsubmit={handleSearchSubmit} />
          {/snippet}
        </PageToolbar>
      </Flex>
    {/snippet}

    {#if searchState.loading && searchState.visible.size === 0}
      <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
    {:else}
      <ResultsList search={searchState} auto />
    {/if}

    {#snippet footer()}
      <PageToolbar>
        {#snippet left()}
          <label class="select-all">
            <input
              type="checkbox"
              name="select_all"
              checked={searchState.selected.length > 0 &&
                searchState.selected.length === searchState.visible.size}
              indeterminate={searchState.selected.length > 0 &&
                searchState.selected.length < searchState.visible.size}
              onchange={selectAll}
            />
            {#if searchState.selected.length > 0}
              {searchState.selected.length.toLocaleString()}
              {$_("inputs.selected")}
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
