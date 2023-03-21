<script>
  import Button from "@/common/Button";
  import Title from "@/common/Title";
  import Project from "./Project";

  import { projects } from "@/manager/projects";
  import { newProject } from "@/manager/layout";
  import { orgsAndUsers } from "@/manager/orgsAndUsers";
  import { _ } from "svelte-i18n";

  function sort(projects) {
    if (projects == null) return [];
    try {
      projects.sort((a, b) => a.title.localeCompare(b.title));
    } catch (e) {}
    return projects;
  }

  $: alphabetizedProjects = sort($projects.projects);
</script>

<style lang="scss">
  .projects {
    padding: 20px 0;

    .titlesection {
      padding: 0 25px;

      @media screen and (max-width: $mobileBreak) {
        padding: 0 25px 0 (25px + $sidebarAdd);
      }
    }

    .projectcontainer {
      padding: 16px 0;
    }
  }

  .sticky {
    background: $sidebar;
    z-index: $sidebarStickyZ;
  }

  small {
    font-size: 13px;
    color: $gray;
    margin: 0 24px;
    display: block;
  }

</style>

<div class="projects">
  <div class="sticky">
    {#if $orgsAndUsers.loggedIn}
      <div class="titlesection">
        <Title small={true}>{$_("projects.header")}</Title>
        <Button on:click={newProject} small={true}
          >{$_("projects.newProject")}</Button
        >
      </div>
    {/if}
  </div>
  {#if $orgsAndUsers.loggedIn}
    <div class="projectcontainer">
      {#if alphabetizedProjects.length > 0}
        {#each alphabetizedProjects as project}
          <Project {project} />
        {/each}
      {:else}
        <small>{$_("projects.createProject")}</small>
      {/if}
    </div>
  {/if}
</div>
