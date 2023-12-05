<script>
  import { _ } from "svelte-i18n";

  import MenuItem from "@/common/MenuItem.svelte";
  import Tooltip from "@/common/Tooltip.svelte";
  import { layout } from "@/manager/layout.js";

  import {
    selectedDocsInProject,
    addSelectedDocsToProject,
    removeSelectedDocsFromProject,
  } from "@/manager/projects.js";

  export let project;

  $: scope =
    $layout.selected.length > 0 ? selectedDocsInProject(project) : "none";

  $: caption =
    scope === "fully"
      ? $_("projectsMenu.remove", { values: { n: $layout.selected.length } })
      : $_("projectsMenu.add", { values: { n: $layout.selected.length } });

  function handleClick() {
    if (scope == "fully") {
      removeSelectedDocsFromProject(project);
    } else {
      addSelectedDocsToProject(project);
    }
  }
</script>

<style>
  .scope {
    color: var(--gray);
    float: right;
    margin-left: 7px;
  }
</style>

<MenuItem on:click={handleClick}>
  <Tooltip delay={500} {caption}>
    {project.title}
    <span class="scope">
      {#if scope === "fully"}✓{/if}
    </span>
  </Tooltip>
</MenuItem>
