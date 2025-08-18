<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Hourglass24, SidebarExpand16 } from "svelte-octicons";

  import type { DocumentResults, Maybe } from "$lib/api/types";
  import Flex from "../common/Flex.svelte";
  import Empty from "../common/Empty.svelte";
  import Button from "../common/Button.svelte";
  import PageToolbar from "../toolbars/PageToolbar.svelte";
  import ResultsList, {
    selected,
    selectedIds,
    total,
    visible,
  } from "../documents/ResultsList.svelte";
  import Search from "../forms/Search.svelte";
  import ContentLayout from "../layouts/ContentLayout.svelte";
  import { sidebars } from "../layouts/Sidebar.svelte";
  import { remToPx } from "@/lib/utils/layout";

  export let search: Promise<Maybe<DocumentResults>>;
  export let query: string;

  function selectAll(e) {
    if (e.target.checked) {
      $selectedIds = [...$visible.keys()];
    } else {
      $selectedIds = [];
    }
  }

  let clientWidth: number;
</script>

<div bind:clientWidth>
  <ContentLayout>
    <Flex slot="header">
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
        <Search name="q" {query} slot="center" />
      </PageToolbar>
    </Flex>
    <svelte:fragment>
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
