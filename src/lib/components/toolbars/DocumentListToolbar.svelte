<script lang="ts">
  import { _ } from "svelte-i18n";
  import { ChevronDown12, Eye16 } from "svelte-octicons";

  import Dropdown from "../common/Dropdown.svelte";
  import Menu from "../common/Menu.svelte";
  import PageToolbar from "./PageToolbar.svelte";
  import Search from "../forms/Search.svelte";
  import NavItem from "../common/NavItem.svelte";
  import VisibleFields from "../documents/VisibleFields.svelte";
  import Sort, {
    type SortOrder,
    type SortField,
  } from "../documents/Sort.svelte";
  import { remToPx } from "$lib/utils/layout";

  export let query: string = "";

  let sort: SortField;
  let order: SortOrder = "desc";
  let fields: Array<SortField> = [
    "updated_at",
    "created_at",
    "page_count",
    "title",
  ];
  let headerToolbarWidth: number;

  $: sort = query ? "score" : "updated_at";
</script>

<PageToolbar bind:width={headerToolbarWidth}>
  <div class="items" slot="center">
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
  .help {
    flex: 1 1 100%;
    font-size: var(--font-xs);
    margin: 0.25rem;
    color: var(--gray-4);
    text-align: left;
  }
  .hide {
    display: none;
  }
</style>
