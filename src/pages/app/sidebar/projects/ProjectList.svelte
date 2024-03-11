<script lang="ts">
  import { writable } from "svelte/store";
  import { _ } from "svelte-i18n";
  import equal from "fast-deep-equal";

  import type { Project, User } from "../../../../api/types";
  import { getProjects } from "../../../../api/project";
  import { projectUrl } from "../../../../search/search.js";
  import { Project as ProjectStructure } from "../../../../structure/project.js";
  import Link from "../../../../router/Link.svelte";
  import Button from "../../../../common/Button.svelte";
  import ProjectListItem from "./ProjectListItem.svelte";
  import ListHeader from "../ListHeader.svelte";
  import {
    pinned as pinStore,
    sortPins,
  } from "../../../../projects/ProjectPin.svelte";
  import { ChevronRight16, ChevronDown16 } from "svelte-octicons";
  import { onMount } from "svelte";

  export let user: User;
  export let editProject;
  export let browseProjects;

  const expanded = writable(true);
  function toggleExpanded() {
    expanded.update((val) => !val);
  }

  async function getPinnedList() {
    const pinned = (await getProjects(user.id)).filter(
      (project) => project.pinned,
    );
    // if they're equivalent, don't update the store value
    // this prevents an endless update loop
    if (!equal($pinStore, pinned)) $pinStore = sortPins(pinned);
  }

  // when the pinstore changes, refetch the list
  $: $pinStore, getPinnedList();

  // fetch the list on mount
  onMount(async () => {
    await getPinnedList();
  });
</script>

<ListHeader>
  <Button secondary action slot="expanded" on:click={toggleExpanded}>
    {#if $expanded}
      <ChevronDown16 />
    {:else}
      <ChevronRight16 />
    {/if}
  </Button>
  {$_("projects.header")}
  <Button slot="action" on:click={browseProjects} small={true}>
    {$_("projectsMenu.browseProjects")}
  </Button>
</ListHeader>
{#if $expanded}
  <div class="projectcontainer">
    {#if $pinStore.length > 0}
      {#each $pinStore as project}
        <Link toUrl={projectUrl(project)}>
          <ProjectListItem
            title={project.title}
            onEditClick={project.edit_access
              ? () => editProject(new ProjectStructure(project))
              : undefined}
          />
        </Link>
      {/each}
    {:else}
      <small>{$_("projects.pinsEmpty")}</small>
    {/if}
  </div>
{/if}

<style>
  .projects {
    padding: 20px 25px;
  }

  .titlesection {
    display: inline-block;
  }

  @media only screen and (max-width: 720px) {
    .titlesection {
      padding: 0 25px 0 0;
    }
  }

  .projects .projectcontainer {
    padding: 16px 0;
  }

  .sticky {
    z-index: var(--sidebarStickyZ);
  }

  small,
  .loading {
    font-size: 13px;
    color: var(--gray);
    text-align: center;
    margin: 0 24px;
    display: block;
  }
</style>
