<script>
  import MenuItem from "@/common/MenuItem";
  import Tooltip from "@/common/Tooltip";
  import { layout, openDispatchAddon } from "@/manager/layout";
  import { handlePlural } from "@/util/string";

  export let addon;

  $: scope = "none"
  
  $: caption =
    scope == "fully"
      ? `Remove ${handlePlural(
          $layout.selected.length,
          "document",
        )} from next addon dispatch`
      : `Add ${handlePlural($layout.selected.length, "document")} to an addon dispatch`;

  function handleClick() {
    openDispatchAddon(addon)
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
  </Tooltip>
</MenuItem>
