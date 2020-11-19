<script>
  import Menu from "@/common/Menu";
  import MenuItem from "@/common/MenuItem";
  import ProjectMenuItem from "./ProjectMenuItem";

  import { layout, newProject, embedProject } from "@/manager/layout";
  import { search } from "@/search/search";
  import { projects } from "@/manager/projects";

  function sort(projects) {
    if (projects == null) return [];
    try {
      projects.sort((a, b) => a.title.localeCompare(b.title));
    } catch (e) {}
    return projects;
  }

  $: alphabetizedProjects = sort($projects.editableProjects);
</script>

<style lang="scss">
  .info {
    color: $gray;
    font-style: italic;
    font-size: $small;
  }
</style>

<Menu>
  <MenuItem primary={true} on:click={newProject}>+ New Project</MenuItem>
  <!-- {#if !$layout.hasSelection && $search.params.oneProjectSearch && $projects.projectsById[$search.params.oneProjectSearch] != null}
    <MenuItem on:click={embedProject}>Share Project</MenuItem>
  {/if} -->
  {#if $layout.hasSelection && $projects.editableProjects.length > 0}
    <MenuItem selectable={false}>
      <div class="small">Project Membership</div>
    </MenuItem>
    {#each alphabetizedProjects as project}
      <ProjectMenuItem {project} />
    {/each}
  {:else}
    <MenuItem selectable={false}>
      {#if $projects.editableProjects.length > 0}
        <div class="info">Select documents to place them in projects</div>
      {:else}
        <div class="info">Create a project to organize and share documents</div>
      {/if}
    </MenuItem>
  {/if}
</Menu>
