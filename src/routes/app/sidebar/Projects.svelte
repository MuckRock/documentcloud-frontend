<script lang="ts">
  import type { Project } from "$lib/api/types";

  import {
    Book16,
    FileDirectory16,
    FileDirectory24,
    Hourglass24,
  } from "svelte-octicons";

  import Pin from "@/common/Pin.svelte";
  import Action from "@/lib/components/common/Action.svelte";
  import Empty from "@/lib/components/common/Empty.svelte";
  import Flex from "@/lib/components/common/Flex.svelte";
  import SidebarGroup from "@/lib/components/sidebar/SidebarGroup.svelte";
  import SidebarItem from "@/lib/components/sidebar/SidebarItem.svelte";

  import { page } from "$app/stores";

  let pinned: Project[] | Promise<Project[]> = [];

  $: pinned = $page.data.pinnedProjects || [];
</script>

<SidebarGroup>
  <SidebarItem slot="title"><FileDirectory16 /> Projects</SidebarItem>
  <a href="/projects" slot="action"><Action icon={Book16}>Explore</Action></a>
  <Flex direction="column" gap={0}>
    {#await pinned}
      <Empty icon={Hourglass24}>Loading pinned projects…</Empty>
    {:then projects}
      {#each projects as project}
        <SidebarItem small>
          <Pin active={project.pinned} />
          {project.title}
        </SidebarItem>
      {:else}
        <Empty icon={FileDirectory24}>Pinned projects will appear here</Empty>
      {/each}
    {/await}
  </Flex>
</SidebarGroup>
