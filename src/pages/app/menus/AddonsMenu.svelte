<script>
  import Menu from "@/common/Menu";
  import MenuItem from "@/common/MenuItem";
  import AddonMenuItem from "./AddonMenuItem";

  import { layout, openAddonBrowser } from "@/manager/layout";
  import { addons, getBrowserAddons } from "@/manager/addons";
  import { _ } from "svelte-i18n";

  function sort(addons) {
    if (addons == null) return [];
    try {
      addons.sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) {}
    return addons;
  }

  $: alphabetizedAddons = sort($addons.activeAddons);

  async function openBrowser() {
    await getBrowserAddons();
    openAddonBrowser();
  }
</script>

<style lang="scss">
  .info {
    color: $gray;
    font-style: italic;
    font-size: $small;
  }
</style>

<Menu>
  <MenuItem on:click={openBrowser}>
    <div class="small">Browse All Add-Ons</div>
  </MenuItem>
  {#each alphabetizedAddons as addon}
    <AddonMenuItem {addon} />
  {/each}
  <MenuItem selectable={true}>
    <div class="info">
      <a target="_blank" href="https://www.documentcloud.org/help/add-ons/">
        {$_("addonsMenu.learnMore")}
      </a>
    </div>
  </MenuItem>
</Menu>
