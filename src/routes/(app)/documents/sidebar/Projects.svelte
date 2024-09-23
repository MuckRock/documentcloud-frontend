<script lang="ts">
  import type { Project } from "$lib/api/types";

  import { page } from "$app/stores";

  import {
    Book16,
    FileDirectory16,
    FileDirectory24,
    Hourglass24,
  } from "svelte-octicons";
  import { _ } from "svelte-i18n";

  import Pin from "@/common/Pin.svelte";
  import Action from "@/lib/components/common/Action.svelte";
  import Empty from "@/lib/components/common/Empty.svelte";
  import Flex from "@/lib/components/common/Flex.svelte";
  import SidebarGroup from "@/lib/components/sidebar/SidebarGroup.svelte";
  import SidebarItem from "@/lib/components/sidebar/SidebarItem.svelte";

  import { canonicalUrl } from "$lib/api/projects";

  let pinned: Project[] | Promise<Project[]> = [];

  $: pinned = $page.data.pinnedProjects || [];

  function sort(projects: Project[]) {
    return projects.sort((a, b) => a.title.localeCompare(b.title));
  }
</script>

<SidebarGroup name="projects">
  <SidebarItem slot="title">
    <FileDirectory16 slot="start" />{$_("sidebar.projects.title")}
  </SidebarItem>
  <a href="/documents/projects/" slot="action">
    <Action icon={Book16}>{$_("common.explore")}</Action>
  </a>
  <Flex direction="column" gap={0}>
    {#await pinned}
      <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
    {:then projects}
      {#each sort(projects) as project}
        <SidebarItem small href={canonicalUrl(project).href}>
          <Pin active={project.pinned} slot="start" />
          {project.title}
        </SidebarItem>
      {:else}
        <Empty icon={FileDirectory24}>{$_("sidebar.projects.pinned")}</Empty>
      {/each}
    {/await}
  </Flex>
</SidebarGroup>
