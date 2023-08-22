<script>
  import { _ } from "svelte-i18n";

  import Button from "@/common/Button.svelte";
  import Title from "@/common/Title.svelte";
  import Project from "./Project.svelte";

  import { projects } from "@/manager/projects.js";
  import { newProject } from "@/manager/layout.js";
  import { orgsAndUsers } from "@/manager/orgsAndUsers.js";

  function sort(projects) {
    if (projects === null) return [];
    try {
      projects.sort((a, b) => a.title.localeCompare(b.title));
    } catch (e) {}
    return projects;
  }

  $: alphabetizedProjects = sort($projects.projects);
</script>

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
    background: var(--sidebar);
    z-index: var(--sidebarStickyZ);
  }

  small {
    font-size: 13px;
    color: var(--gray);
    margin: 0 24px;
    display: block;
  }
</style>

<details class="projects">
  <summary class="sticky">
    <div class="titlesection">
      <Title small={true}>{$_("projects.header")}</Title>
      <Button on:click={newProject} small={true}
        >{$_("projects.newProject")}</Button
      >
    </div>
  </summary>
  <div class="projectcontainer">
    {#if alphabetizedProjects.length > 0}
      {#each alphabetizedProjects as project}
        <Project {project} />
      {/each}
    {:else}
      <small>{$_("projects.createProject")}</small>
    {/if}
  </div>
</details>
