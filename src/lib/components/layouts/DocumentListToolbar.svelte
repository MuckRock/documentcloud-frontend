<script lang="ts">
  import { _ } from "svelte-i18n";
  import Flex from "../common/Flex.svelte";
  import PageToolbar from "../common/PageToolbar.svelte";
  import Search from "../forms/Search.svelte";
  import { remToPx } from "$lib/utils/layout";
  import Dropdown from "../common/Dropdown.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import { ChevronDown12, Paintbrush16 } from "svelte-octicons";
  import Menu from "../common/Menu.svelte";
  import VisibleFields from "../documents/VisibleFields.svelte";

  export let query: string = "";

  let headerToolbarWidth: number;
</script>

<PageToolbar bind:width={headerToolbarWidth}>
  <Flex slot="left">
    <Dropdown>
      <SidebarItem slot="anchor">
        <Paintbrush16 slot="start" />
        {$_("common.customize")}
        <ChevronDown12 slot="end" />
      </SidebarItem>
      <Menu>
        <VisibleFields />
      </Menu>
    </Dropdown>
  </Flex>
  <Flex slot="right">
    <div style:flex="1 1 auto">
      <Search name="q" {query} placeholder={$_("common.search")} />
      <p class="help" class:hide={headerToolbarWidth < remToPx(38)}>
        {@html $_("search.help")}
        <a target="_blank" href="/help/search/">
          {$_("search.more")}
        </a>
      </p>
    </div>
  </Flex>
</PageToolbar>

<style>
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
