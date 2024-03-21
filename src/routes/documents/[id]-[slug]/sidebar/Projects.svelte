<script lang="ts">
  import type { Project } from "$lib/api/types";

  import { FileDirectory16 } from "svelte-octicons";

  import Empty from "@/lib/components/common/Empty.svelte";
  import SidebarGroup from "@/lib/components/sidebar/SidebarGroup.svelte";
  import SidebarItem from "@/lib/components/sidebar/SidebarItem.svelte";

  export let projects: Project[];
</script>

<SidebarGroup>
  <h2 slot="title">
    <FileDirectory16 />
    Projects
  </h2>

  {#each projects as project}
    <SidebarItem>
      {project.title}
    </SidebarItem>
  {:else}
    <Empty icon={FileDirectory16}>Add this document to projects</Empty>
  {/each}
</SidebarGroup>
