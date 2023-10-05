<script>
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import Menu from "../../../common/Menu.svelte";
  import MenuItem from "../../../common/MenuItem.svelte";
  import { pinned } from "../../../addons/AddOnPin.svelte";

  $: alphabetizedAddons = $pinned.sort((a, b) => a.name.localeCompare(b.name));

  onMount(() => {
    window.plausible =
      window.plausible ||
      function () {
        (window.plausible.q = window.plausible.q || []).push(arguments);
      };
  });

  function addonURL(addon) {
    return `#add-ons/${addon.repository}`;
  }
</script>

<style>
  :global(a.promo) {
    color: var(--darkgray, rgba(0, 0, 0, 0.8));
    font-style: italic;
    font-size: var(--normal, 16px);
  }

  hr {
    margin: 0.5em 21px;
  }
</style>

<Menu>
  {#each alphabetizedAddons as addon}
    <MenuItem href={addonURL(addon)}>
      {addon.name}
    </MenuItem>
  {/each}

  <hr />

  <MenuItem
    class="promo plausible-event-name=app-add-ons plausible-event-target=browser"
    href="#add-ons"
    >{$_("addonsMenu.browseAll")}
  </MenuItem>
  <MenuItem
    class="promo plausible-event-name=app-add-ons plausible-event-target=runs"
    href="#add-ons/runs"
    >{$_("addonsMenu.addonRuns")}
  </MenuItem>

  <MenuItem
    class="promo plausible-event-name=app-add-ons plausible-event-target=help"
    target="_blank"
    href="https://www.documentcloud.org/help/add-ons/"
  >
    {$_("addonsMenu.learnMore")}
  </MenuItem>
</Menu>
