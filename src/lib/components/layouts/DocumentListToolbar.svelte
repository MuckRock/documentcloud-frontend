<script lang="ts">
  import { _ } from "svelte-i18n";
  import Flex from "../common/Flex.svelte";
  import PageToolbar from "../common/PageToolbar.svelte";
  import Search from "../forms/Search.svelte";
  import { remToPx } from "$lib/utils/layout";
  import Dropdown from "../common/Dropdown.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import { ChevronDown12, Eye16, Paintbrush16 } from "svelte-octicons";
  import Menu from "../common/Menu.svelte";
  import VisibleFields from "../documents/VisibleFields.svelte";

  export let query: string = "";

  let headerToolbarWidth: number;
</script>

<PageToolbar bind:width={headerToolbarWidth}>
  <div class="items" slot="center">
    <div class="margin-xs">
      <Dropdown>
        <SidebarItem slot="anchor">
          <Eye16 slot="start" />
          {$_("documentBrowser.fieldsAnchor")}
          <ChevronDown12 slot="end" />
        </SidebarItem>
        <Menu>
          <VisibleFields />
        </Menu>
      </Dropdown>
    </div>
    <div style:flex="1 1 auto">
      <Search name="q" {query} placeholder={$_("common.search")} />
      <p class="help" class:hide={headerToolbarWidth < remToPx(38)}>
        {@html $_("search.help")}
        <a target="_blank" href="/help/search/">
          {$_("search.more")}
        </a>
      </p>
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
