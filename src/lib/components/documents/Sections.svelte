<script lang="ts">
  import { _ } from "svelte-i18n";
  import type { Document } from "$lib/api/types";
  import Dropdown from "@/common/Dropdown2.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import { ChevronUp12, ListOrdered16, ListOrdered24 } from "svelte-octicons";
  import Menu from "@/common/Menu.svelte";
  import MenuItem from "@/common/MenuItem.svelte";
  import Empty from "../common/Empty.svelte";

  export let document: Document;
</script>

<Dropdown id="sections" position="top left" --offset="5px">
  <div class="toolbarItem" slot="title">
    <SidebarItem>
      <ListOrdered16 />
      Sections
      <ChevronUp12 />
    </SidebarItem>
  </div>
  <Menu>
    {#each document.sections ?? [] as section}
      <MenuItem>{section.title}</MenuItem>
    {:else}
      <Empty icon={ListOrdered24}>
        {#if document.edit_access}
          <p>{$_("sidebar.toc.cta")}</p>
        {:else}
          <p>{$_("sidebar.toc.empty")}</p>
        {/if}
      </Empty>
    {/each}
  </Menu>
</Dropdown>

<style>
  .toolbarItem {
    border-radius: 0.5rem;
    overflow: hidden;
  }
</style>
