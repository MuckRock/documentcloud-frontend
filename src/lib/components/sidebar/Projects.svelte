<script lang="ts">
  import type { Project } from "$lib/api/types";

  // Storybook doesn't support page state yet
  import { page } from "$app/stores";

  import { _ } from "svelte-i18n";
  import {
    FileDirectory16,
    Hourglass24,
    People16,
    Person16,
    Pin16,
    Search16,
  } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import SidebarGroup from "$lib/components/sidebar/SidebarGroup.svelte";
  import SignedIn from "../common/SignedIn.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";
  import Pin from "$lib/components/common/Pin.svelte";

  import { canonicalUrl } from "$lib/api/projects";

  let pinned: Project[] | Promise<Project[]> = $derived(
    $page.data.pinnedProjects || [],
  );

  function sort(projects: Project[]) {
    return projects.sort((a, b) => a.title.localeCompare(b.title));
  }
</script>

<SignedIn>
  <SidebarGroup name="projects">
    {#snippet title()}
      <NavItem>
        {#snippet start()}
          <FileDirectory16 />
        {/snippet}
        {$_("sidebar.projects.title")}
      </NavItem>
    {/snippet}
    {#snippet action()}
      <Button
        ghost
        mode="primary"
        size="small"
        minW={false}
        href="/projects?list=public"
      >
        <Search16 height={14} width={14} />
        {$_("common.explore")}
      </Button>
    {/snippet}
    <NavItem
      small
      active={$page.url.searchParams?.get("list") === "owned"}
      href="/projects?list=owned"
    >
      {#snippet start()}
        <Person16 height={14} width={14} />
      {/snippet}
      {$_("projects.yours")}
    </NavItem>
    <NavItem
      small
      active={$page.url.searchParams?.get("list") === "shared"}
      href="/projects?list=shared"
    >
      {#snippet start()}
        <People16 height={14} width={14} />
      {/snippet}
      {$_("projects.shared")}
    </NavItem>
    {#await pinned}
      <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
    {:then projects}
      {#each sort(projects) as project}
        <NavItem small href={canonicalUrl(project).href}>
          {#snippet start()}
            <Pin size={0.875} active={project.pinned} />
          {/snippet}
          {project.title}
        </NavItem>
      {:else}
        <NavItem small disabled>
          {#snippet start()}
            <Pin16 />
          {/snippet}
          {$_("sidebar.projects.pinned")}
        </NavItem>
      {/each}
    {/await}
  </SidebarGroup>
</SignedIn>
