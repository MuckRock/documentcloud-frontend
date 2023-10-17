<script lang="ts">
  import { _ } from "svelte-i18n";

  import Dropdown from "../../../common/Dropdown.svelte";
  import Menu from "../../../common/Menu.svelte";
  import MenuItem from "../../../common/MenuItem.svelte";
  import MenuTitle from "../../../common/MenuTitle.svelte";
  import Button from "../../../common/Button.svelte";
  import Link from "../../../router/Link.svelte";

  // TODO: Handle flow to upgrade user to Pro account
  function triggerPremiumUpgradeFlow() {
    alert("Upgrade to Premium!");
  }
</script>

<Dropdown name="premiumUpgrade" fixed={true}>
  <MenuTitle slot="title" label={$_("authSection.premiumUpgrade")} />
  <Menu>
    <MenuItem>
      <Button
        label="Start Free Trial"
        tertiary
        on:click={triggerPremiumUpgradeFlow}
      />
    </MenuItem>
    <Link toUrl="/help/premium" color={true}>
      <MenuItem>{$_("authSection.premium")}</MenuItem>
    </Link>
  </Menu>
</Dropdown>
