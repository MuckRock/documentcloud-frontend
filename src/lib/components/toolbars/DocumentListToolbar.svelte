<script lang="ts">
  import { _ } from "svelte-i18n";
  import { ChevronDown12, Eye16 } from "svelte-octicons";

  import Dropdown from "../common/Dropdown.svelte";
  import Menu from "../common/Menu.svelte";
  import PageToolbar from "./PageToolbar.svelte";
  import NavItem from "../common/NavItem.svelte";
  import DocumentSearch from "../documents/Search.svelte";
  import VisibleFields from "../documents/VisibleFields.svelte";
  import Sort, {
    type SortOrder,
    type SortField,
  } from "../documents/Sort.svelte";
  import { remToPx } from "$lib/utils/layout";
  import Filter, {
    defaultFilters,
    type FilterFields,
  } from "../documents/Filter.svelte";

  export let query: string = "";

  let sort: SortField;
  let order: SortOrder = "desc";
  let fields: Array<SortField> = [
    "updated_at",
    "created_at",
    "page_count",
    "title",
  ];
  let filters: FilterFields = defaultFilters;

  let headerToolbarWidth: number;

  $: sort = query ? "score" : "updated_at";
</script>

<PageToolbar bind:width={headerToolbarWidth}>
  <div class="items" slot="center">
    <div style:flex="1 1 auto">
      <DocumentSearch />
    </div>
    <div class="margin-xs" class:hide={headerToolbarWidth < remToPx(38)}>
      <Filter bind:filters />
      <Sort bind:sort bind:order {fields} {query} />
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
