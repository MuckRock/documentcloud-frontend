<script lang="ts">
  import type { Project } from "$lib/api/types";

  import { FileDirectory16, FileDirectory24 } from "svelte-octicons";

  import Empty from "@/lib/components/common/Empty.svelte";
  import SidebarGroup from "@/lib/components/sidebar/SidebarGroup.svelte";
  import SidebarItem from "@/lib/components/sidebar/SidebarItem.svelte";

  export let projects: Project[];
</script>

<SidebarGroup name="projects:viewer">
  <SidebarItem slot="title">
    <FileDirectory16 />
    Projects
  </SidebarItem>

  {#each projects as project}
    <SidebarItem small>
      {project.title}
    </SidebarItem>
  {:else}
    <Empty icon={FileDirectory24}>Add this document to projects</Empty>
  {/each}
</SidebarGroup>
