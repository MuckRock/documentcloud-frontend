<script>
  import Menu from "@/common/Menu";
  import MenuItem from "@/common/MenuItem";
  import ProjectMenuItem from "./ProjectMenuItem";

  import { layout, newProject } from "@/manager/layout";
  import { projects } from "@/manager/projects";

  function sort(projects) {
    if (projects == null) return [];
    try {
      projects.sort((a, b) => a.title.localeCompare(b.title));
    } catch (e) {}
    return projects;
  }

  $: alphabetizedProjects = sort($projects.addRemoveableProjects);
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
  {#if $layout.hasSelection && $projects.addRemoveableProjects.length > 0}
    <MenuItem selectable={false}>
      <div class="small">Project Membership</div>
    </MenuItem>
    {#each alphabetizedProjects as project}
      <ProjectMenuItem {project} />
    {/each}
  {:else}
    <MenuItem selectable={false}>
      {#if $projects.addRemoveableProjects.length > 0}
        <div class="info">Select documents to place them in projects</div>
      {:else}
        <div class="info">Create a project to organize and share documents</div>
      {/if}
    </MenuItem>
  {/if}
</Menu>
