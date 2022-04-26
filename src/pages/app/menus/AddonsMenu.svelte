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
      addons.sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) {}
    return addons;
  }

  $: alphabetizedAddons = sort($addons.activeAddons);
</script>

<style lang="scss">
  .info {
    color: $gray;
    font-style: italic;
    font-size: $small;
  }
</style>

<Menu>
  <MenuItem selectable={false}>
    <div class="small">{$_("addonsMenu.addonsList")}</div>
  </MenuItem>
  {#each alphabetizedAddons as addon}
    <AddonMenuItem {addon} />
  {/each}
  {#if !$layout.hasSelection}
    <MenuItem selectable={false}>
      <div class="info">{$_("addonsMenu.selectDocs")}</div>
    </MenuItem>
  {/if}
  <MenuItem selectable={true}>
    <div class="info">
      <a target="_blank" href="https://www.documentcloud.org/help/add-ons/">
        {$_("addonsMenu.learnMore")}
      </a>
    </div>
  </MenuItem>
</Menu>
