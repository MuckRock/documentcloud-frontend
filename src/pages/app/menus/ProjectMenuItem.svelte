<script>
  import MenuItem from "@/common/MenuItem";
  import Tooltip from "@/common/Tooltip";
  import { layout } from "@/manager/layout";
  import {
    selectedDocsInProject,
    addSelectedDocsToProject,
    removeSelectedDocsFromProject
  } from "@/manager/projects";
  import { handlePlural } from "@/util/string";

  export let project;

  $: scope =
    $layout.selected.length > 0 ? selectedDocsInProject(project) : "none";

  $: caption =
    scope == "fully"
      ? `Remove ${handlePlural(
          $layout.selected.length,
          "document"
        )} from project`
      : `Add ${handlePlural($layout.selected.length, "document")} to project`;

  function handleClick() {
    if (scope == "fully") {
      removeSelectedDocsFromProject(project);
    } else {
      addSelectedDocsToProject(project);
    }
  }
</script>

<style lang="scss">
  .scope {
    color: gray;
    float: right;
    margin-left: 7px;
  }
</style>

<MenuItem on:click={handleClick}>
  <Tooltip delay={500} {caption}>
    {project.title}
    <span class="scope">
      {#if scope == 'fully'}✓{/if}
    </span>
  </Tooltip>
</MenuItem>
