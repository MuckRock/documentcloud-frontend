<script>
  import Menu from "@/common/Menu";
  import MenuItem from "@/common/MenuItem";

  import { layout, newProject } from "@/manager/layout";
  import { projects, addSelectedDocsToProject } from "@/manager/projects";
</script>

<style lang="scss">
  .info {
    color: $gray;
    font-style: italic;
    font-size: $small;
  }

  .small {
    color: $gray;
    font-size: 11px;
    text-transform: uppercase;
    margin: 3px 0 0 0;
  }
</style>

<Menu>
  <MenuItem primary={true} on:click={newProject}>+ New Project</MenuItem>
  {#if $layout.hasSelection}
    <MenuItem selectable={false}>
      <div class="small">Add to project</div>
    </MenuItem>
    {#each $projects.projects as project}
      <MenuItem on:click={() => addSelectedDocsToProject(project)}>
        {project.title}
      </MenuItem>
    {/each}
  {:else}
    <MenuItem selectable={false}>
      <div class="info">Select documents to place them in projects</div>
    </MenuItem>
  {/if}
</Menu>
