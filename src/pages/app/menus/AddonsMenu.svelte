<script>
  import Menu from "@/common/Menu";
  import MenuItem from "@/common/MenuItem";
  import AddonMenuItem from "./AddonMenuItem";

  import { layout, newProject } from "@/manager/layout";
  import { addons } from "@/manager/addons";
  import { _ } from "svelte-i18n";

  function sort(addons) {
    if (addons == null) return [];
    try {
      addons.sort((a, b) => a.name.localeCompare(b.title));
    } catch (e) {}
    return addons;
  }

  $: alphabetizedAddons = sort($addons.addons);
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
    {$_("addonsMenu.newAddon")}
  </MenuItem>
  {#if $layout.hasSelection}
    <MenuItem selectable={false}>
      <div class="small">{$_("addonsMenu.addonsList")}</div>
    </MenuItem>
    {#each alphabetizedAddons as addon}
      <AddonMenuItem {addon} />
    {/each}
  {:else}
    <MenuItem selectable={false}>
      {#if $addons.addons.length > 0}
        <div class="info">{$_("addonsMenu.selectDocs")}</div>
      {:else}
        <div class="info">{$_("addonsMenu.createAddon")}</div>
      {/if}
    </MenuItem>
  {/if}
</Menu>
