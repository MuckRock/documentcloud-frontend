<script>
  import MenuItem from "@/common/MenuItem";
  import Tooltip from "@/common/Tooltip";
  import { layout, dispatchAddonSelected,openDispatchAddon } from "@/manager/layout";
  import {
    selectedDocsInProject,
  //   addSelectedDocsToProject,
  //   removeSelectedDocsFromProject,
  } from "@/manager/addons";
  import { handlePlural } from "@/util/string";

  export let addon;

  $: scope = "none"
  //   $layout.selected.length > 0 ? selectedDocsInProject(addon) : "none";

  $: caption =
    scope == "fully"
      ? `Remove ${handlePlural(
          $layout.selected.length,
          "document",
        )} from next addon dispatch`
      : `Add ${handlePlural($layout.selected.length, "document")} to next addon dispatch`;

  function handleClick() {
    openDispatchAddon()
  //   if (scope == "fully") {
  //     removeSelectedDocsFromProject(project);
  //   } else {
  //     addSelectedDocsToProject(project);
  //   }
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
    {addon.name}
    <span class="scope">
      <!-- {#if scope == "fully"}✓{/if} -->
    </span>
  </Tooltip>
</MenuItem>
