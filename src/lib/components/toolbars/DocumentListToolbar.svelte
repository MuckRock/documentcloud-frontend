<script lang="ts">
  import { _ } from "svelte-i18n";
  import { ChevronDown12, Eye16 } from "svelte-octicons";

  import Dropdown from "../common/Dropdown.svelte";
  import Menu from "../common/Menu.svelte";
  import PageToolbar from "./PageToolbar.svelte";
  import NavItem from "../common/NavItem.svelte";
  import DocumentSearch from "../documents/search/Search.svelte";
  import VisibleFields from "../documents/VisibleFields.svelte";
  import Sort, {
    type SortDirection,
    type SortField,
  } from "../documents/Sort.svelte";
  import { remToPx } from "$lib/utils/layout";
  import Filter, {
    defaultFilters,
    type FilterFields,
  } from "../documents/Filter.svelte";

  interface Props {
    query?: string;
  }

  let { query = "" }: Props = $props();

  let headerToolbarWidth: number = $state(800);
</script>

<PageToolbar bind:width={headerToolbarWidth}>
  {#snippet center()}
    <div class="items">
      <div style:flex="1 1 auto">
        <Search name="q" {query} placeholder={$_("common.search")} />
        <p class="help" class:hide={headerToolbarWidth < remToPx(38)}>
          {@html $_("search.help")}
          <a target="_blank" href="/help/search/">
            {$_("search.more")}
          </a>
        </p>
      </div>
      <div class="margin-xs" class:hide={headerToolbarWidth < remToPx(38)}>
        <Dropdown>
          <NavItem slot="anchor">
            <Eye16 slot="start" />
            {$_("documentBrowser.fieldsAnchor")}
            <ChevronDown12 slot="end" />
          </NavItem>
          <Menu slot="inner">
            <VisibleFields />
          </Menu>
        </Dropdown>
      </div>
    </div>
  {/snippet}
</PageToolbar>

<style>
  .items {
    display: flex;
    gap: 0.25rem;
    align-items: start;
  }
  .margin-xs {
    margin: 0.25rem;
  }
</style>
