<script lang="ts">
  import { _ } from "svelte-i18n";
  import { ChevronDown12, Eye16 } from "svelte-octicons";

  import Dropdown from "../common/Dropdown.svelte";
  import Menu from "../common/Menu.svelte";
  import PageToolbar from "../common/PageToolbar.svelte";
  import DocumentSearch from "../documents/search/Search.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import VisibleFields from "../documents/VisibleFields.svelte";

  let headerToolbarWidth: number;
</script>

<PageToolbar bind:width={headerToolbarWidth}>
  <div class="items" slot="center">
    <div style:flex="1 1 auto">
      <DocumentSearch />
    </div>
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
