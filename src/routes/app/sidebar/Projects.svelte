<script lang="ts">
  import type { Project } from "$lib/api/types";
  import Pin from "@/common/Pin.svelte";
  import Action from "@/lib/components/common/Action.svelte";
  import Flex from "@/lib/components/common/Flex.svelte";
  import SidebarGroup from "@/lib/components/sidebar/SidebarGroup.svelte";
  import SidebarItem from "@/lib/components/sidebar/SidebarItem.svelte";
  import { Book16, FileDirectory16 } from "svelte-octicons";

  import { page } from "$app/stores";

  let pinned: Project[] | Promise<Project[]> = [];

  $: pinned = $page.data.pinnedProjects || [];
</script>

<SidebarGroup>
  <SidebarItem slot="title"><FileDirectory16 /> Projects</SidebarItem>
  <Action slot="action" icon={Book16}>Explore</Action>
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
