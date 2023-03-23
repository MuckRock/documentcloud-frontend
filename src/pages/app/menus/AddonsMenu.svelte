<script>
  import Menu from "@/common/Menu";
  import MenuItem from "@/common/MenuItem";
  import AddonMenuItem from "./AddonMenuItem";

  import { openAddonBrowser } from "@/manager/layout";
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
  .promo {
    color: $darkgray;
    font-style: italic;
    font-size: $normal;
  }
</style>

<Menu>
  <MenuItem on:click={openBrowser}>
    <div class="small">{$_("addonsMenu.browseAll")}</div>
  </MenuItem>
  {#each alphabetizedAddons as addon}
    <AddonMenuItem {addon} />
  {/each}
  <MenuItem selectable={true}>
    <div class="promo">
      <a target="_blank" href="https://www.documentcloud.org/help/add-ons/">
        {$_("addonsMenu.learnMore")}
      </a>
    </div>
  </MenuItem>
</Menu>
