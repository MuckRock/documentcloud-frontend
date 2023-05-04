<script>
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import Menu from "@/common/Menu.svelte";
  import MenuItem from "@/common/MenuItem.svelte";
  import AddonMenuItem from "./AddonMenuItem.svelte";

  import { openAddonBrowser } from "@/manager/layout.js";
  import { addons, getBrowserAddons } from "@/manager/addons.js";
  import { setHash } from "@/router/router.js";

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
    setHash("add-ons");
    plausible("app-add-ons", { props: { target: "browser" } });
  }

  onMount(() => {
    window.plausible =
      window.plausible ||
      function () {
        (window.plausible.q = window.plausible.q || []).push(arguments);
      };
  });
</script>

<style>
  .promo {
    color: var(--darkgray, rgba(0, 0, 0, 0.8));
    font-style: italic;
    font-size: var(--normal, 16px);
  }
</style>

<Menu>
  <MenuItem on:click={openBrowser}>
    <div class="small">
      {$_("addonsMenu.browseAll")}
    </div>
  </MenuItem>
  {#each alphabetizedAddons as addon}
    <AddonMenuItem {addon} />
  {/each}
  <MenuItem selectable={true}>
    <div class="promo">
      <a
        class="plausible-event-name=app-add-ons plausible-event-target=help"
        target="_blank"
        href="https://www.documentcloud.org/help/add-ons/"
      >
        {$_("addonsMenu.learnMore")}
      </a>
    </div>
  </MenuItem>
</Menu>
