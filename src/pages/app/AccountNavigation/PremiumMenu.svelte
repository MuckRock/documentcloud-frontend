<script lang="ts">
  import { _ } from "svelte-i18n";

  import Dropdown, { closeDropdown } from "../../../common/Dropdown2.svelte";
  import Menu from "../../../common/Menu.svelte";
  import MenuItem from "../../../common/MenuItem.svelte";
  import MenuTitle from "../../../common/MenuTitle.svelte";
  import Button from "../../../common/Button.svelte";
  import Link from "../../../router/Link.svelte";
  import Credit from "../../../common/icons/Credit.svelte";

  import { Plug16, Organization16 } from "svelte-octicons";
  import { SQUARELET_URL } from "../../../api/auth";

  export let isPremium: boolean;

  // TODO: Handle flow to upgrade user to Pro account
  function triggerPremiumUpgradeFlow() {
    alert("Upgrade to Premium!");
  }

  const dropdownId = "organization";
  function close() {
    closeDropdown(dropdownId);
  }
</script>

<style>
  .premium {
    font-weight: 600;
  }
  .whiteBg {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 1.5rem;
    width: 1.5rem;
    background: var(--white, #ffffff);
  }
  .learnMore {
    font-size: 0.8em;
    color: var(--gray);
  }
  .learnMore:hover {
    opacity: 0.7;
  }
  .menuInsert {
    max-width: 16rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0.5rem;
    padding: 1rem;
    gap: 0.5rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: var(--radius);
  }
  .heading,
  .description {
    margin: 0;
    opacity: 0.8;
  }
</style>

<Dropdown id={dropdownId} titleColor="premium">
  <span class="premium" slot="title">
    <MenuTitle label={$_("authSection.premiumUpgrade.title")}>
      <div class="whiteBg" slot="icon"><Credit size={1.5} /></div>
    </MenuTitle>
  </span>
  <Menu>
    {#if isPremium}
      <div class="menuInsert" />
    {:else}
      <div class="menuInsert">
        <h3 class="heading">{$_("authSection.premiumUpgrade.heading")}</h3>
        <p class="description">
          {$_("authSection.premiumUpgrade.description")}
        </p>
        <Button
          label="Start Free Trial"
          fullWidth={true}
          premium={true}
          on:click={triggerPremiumUpgradeFlow}
        />
        <div class="learnMore">
          <Link toUrl="/help/premium" color={true} on:click={close}>
            {$_("authSection.premiumUpgrade.docs")}
          </Link>
        </div>
      </div>
    {/if}
    <Link toUrl="#add-ons" color={true}>
      <MenuItem on:click={close}>
        <Plug16 slot="icon" />
        {$_("authSection.premiumUpgrade.addons")}
      </MenuItem>
    </Link>
    <span>
      <MenuItem
        href={`${SQUARELET_URL}/organizations`}
        target="_blank"
        on:click={close}
      >
        <Organization16 slot="icon" />
        {$_("authSection.premiumUpgrade.orgs")}
      </MenuItem>
    </span>
    <slot />
  </Menu>
</Dropdown>
