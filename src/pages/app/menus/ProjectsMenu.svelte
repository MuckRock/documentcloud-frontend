<script>
  import Menu from "@/common/Menu.svelte";
  import MenuItem from "@/common/MenuItem.svelte";
  import ProjectMenuItem from "./ProjectMenuItem.svelte";

  import { layout, newProject } from "@/manager/layout.js";
  import { projects } from "@/manager/projects.js";
  import { _ } from "svelte-i18n";

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
  <MenuItem primary={true} on:click={newProject}>
    {$_("projectsMenu.newProject")}
  </MenuItem>
  {#if $layout.hasSelection && $projects.addRemoveableProjects.length > 0}
    <MenuItem selectable={false}>
      <div class="small">{$_("projectsMenu.projMembership")}</div>
    </MenuItem>
    {#each alphabetizedProjects as project}
      <ProjectMenuItem {project} />
    {/each}
  {:else}
    <MenuItem selectable={false}>
      {#if $projects.addRemoveableProjects.length > 0}
        <div class="info">{$_("projectsMenu.selectDocs")}</div>
      {:else}
        <div class="info">{$_("projectsMenu.createProj")}</div>
      {/if}
    </MenuItem>
  {/if}
</Menu>
