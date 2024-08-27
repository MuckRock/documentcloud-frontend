<script lang="ts">
  import { _ } from "svelte-i18n";
  import type { Project } from "$lib/api/types";

  import {
    ChevronDown12,
    FileDirectory16,
    FileDirectory24,
  } from "svelte-octicons";

  import Empty from "@/lib/components/common/Empty.svelte";
  import SidebarItem from "@/lib/components/sidebar/SidebarItem.svelte";
  import Dropdown2 from "@/common/Dropdown2.svelte";
  import Menu from "@/common/Menu.svelte";
  import MenuItem from "@/common/MenuItem.svelte";

  export let projects: Project[];
</script>

<Dropdown2 id="projects:viewer" position="bottom left" --offset=".25rem">
  <SidebarItem slot="title">
    <FileDirectory16 />
    {$_("sidebar.projects.title")}
    <ChevronDown12 />
  </SidebarItem>
  <Menu>
    {#each projects as project}
      <MenuItem>
        <FileDirectory16 slot="icon" />
        {project.title}
      </MenuItem>
    {:else}
      <Empty icon={FileDirectory24}>{$_("sidebar.projects.empty")}</Empty>
    {/each}
  </Menu>
</Dropdown2>
