<script lang="ts">
  import { _ } from "svelte-i18n";

  import { User } from "../../../../api/types/orgAndUser";
  import { getProjects } from "../../../../api/project.js";
  import { projectUrl } from "../../../../search/search.js";
  import Link from "../../../../router/Link.svelte";
  import Button from "../../../../common/Button.svelte";
  import ProjectListItem from "./Project.svelte";
  import ListHeader from "../ListHeader.svelte";

  export let user: User;
  export let newProject;
  export let editProject;

  function sort(projects) {
    if (projects === null) return [];
    try {
      projects.sort((a, b) => a.title.localeCompare(b.title));
    } catch (e) {}
    return projects;
  }

  async function getProjectList() {
    return sort(await getProjects(user.id));
  }

  const promise = getProjectList();
</script>

<ListHeader>
  {$_("projects.header")}
  <Button on:click={newProject} small={true} slot="action"
    >{$_("projects.newProject")}</Button
  >
</ListHeader>
{#await promise}
  <p>Loading…</p>
{:then projects}
  <div class="projectcontainer">
    {#if projects.length > 0}
      {#each projects as project}
        <Link toUrl={projectUrl(project)}>
          <ProjectListItem
            title={project.title}
            onEditClick={project.editAccess
              ? () => editProject(project)
              : undefined}
          />
        </Link>
      {/each}
    {:else}
      <small>{$_("projects.createProject")}</small>
    {/if}
  </div>
{:catch}
  <p>Error!</p>
{/await}

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

  small {
    font-size: 13px;
    color: var(--gray);
    margin: 0 24px;
    display: block;
  }
</style>
