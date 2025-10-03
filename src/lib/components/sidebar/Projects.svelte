<script lang="ts">
  import type { Project } from "$lib/api/types";

  import { page } from "$app/stores";

  import {
    FileDirectory16,
    Hourglass24,
    People16,
    Person16,
    Pin16,
    Search16,
  } from "svelte-octicons";
  import { _ } from "svelte-i18n";

  import Pin from "$lib/components/common/Pin.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import SidebarGroup from "$lib/components/sidebar/SidebarGroup.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";

  import { canonicalUrl } from "$lib/api/projects";
  import Button from "../common/Button.svelte";
  import SignedIn from "../common/SignedIn.svelte";

  let pinned: Project[] | Promise<Project[]> = [];

  $: pinned = $page.data.pinnedProjects || [];

  function sort(projects: Project[]) {
    return projects.sort((a, b) => a.title.localeCompare(b.title));
  }
</script>

<SignedIn>
  <SidebarGroup name="projects">
    <NavItem slot="title">
      <FileDirectory16 slot="start" />{$_("sidebar.projects.title")}
    </NavItem>
    <Button
      ghost
      mode="primary"
      size="small"
      minW={false}
      href="/projects?list=public"
      slot="action"
    >
      <Search16 height={14} width={14} />
      {$_("common.explore")}
    </Button>
    <NavItem
      small
      active={$page.url.searchParams?.get("list") === "owned"}
      href="/projects?list=owned"
    >
      <Person16 height={14} width={14} slot="start" />
      {$_("projects.yours")}
    </NavItem>
    <NavItem
      small
      active={$page.url.searchParams?.get("list") === "shared"}
      href="/projects?list=shared"
    >
      <People16 height={14} width={14} slot="start" />
      {$_("projects.shared")}
    </NavItem>
    {#await pinned}
      <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
    {:then projects}
      {#each sort(projects) as project}
        <NavItem small href={canonicalUrl(project).href}>
          <Pin size={0.875} active={project.pinned} slot="start" />
          {project.title}
        </NavItem>
      {:else}
        <NavItem small disabled>
          <Pin16 slot="start" />
          {$_("sidebar.projects.pinned")}
        </NavItem>
      {/each}
    {/await}
  </SidebarGroup>
</SignedIn>
