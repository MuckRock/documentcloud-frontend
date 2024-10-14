<script lang="ts">
  import { _, locale } from "svelte-i18n";

  import Dropdown from "$lib/components/common/Dropdown.svelte";
  import Menu from "$lib/components/common/Menu.svelte";
  import MenuItem from "$lib/components/common/MenuItem.svelte";
  import MenuInsert from "$lib/components/common/MenuInsert.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";
  import Button from "../../../common/Button.svelte";
  import Premium from "../../../common/icons/Premium.svelte";
  import CreditMeter, {
    formatResetDate,
  } from "../../../premium-credits/CreditMeter.svelte";
  import Link from "../../../router/Link.svelte";

  import { Plug16, Organization16 } from "svelte-octicons";
  import { SQUARELET_URL } from "../../../api/auth";
  import type { Org } from "../../../api/types/orgAndUser";

  import {
    isPremiumOrg,
    // triggerCreditPurchaseFlow,
    triggerPremiumUpgradeFlow,
  } from "../../../manager/orgsAndUsers.js";

  export let org: Org;

  $: isPremium = isPremiumOrg(org);
  $: ({
    monthly_credits,
    monthly_credit_allowance,
    purchased_credits,
    credit_reset_date,
  } = org);
</script>

<Dropdown>
  <span class="premium" slot="anchor">
    <SidebarItem>
      <Premium size={1.5} slot="start" />
      {$_("authSection.premiumUpgrade.title")}
    </SidebarItem>
  </span>
  <Menu slot="default" let:close>
    {#if isPremium}
      <MenuInsert>
        <CreditMeter
          id="pro-credits"
          label={$_("authSection.credits.monthlyPro")}
          helpText={$_("authSection.credits.refreshOn", {
            values: {
              date: formatResetDate(credit_reset_date, $locale),
            },
          })}
          value={monthly_credits}
          max={monthly_credit_allowance}
        />
        <!-- TODO: Support credit purchases (#342)
        <CreditMeter
          id="purchased-credits"
          label={$_("authSection.credits.purchased")}
          helpText={$_("authSection.credits.purchasedHelpText")}
          value={purchased_credits}
        />
        <Button
          premium={true}
          fullWidth={true}
          label={$_("authSection.credits.purchaseCreditsButton")}
          on:click={triggerCreditPurchaseFlow}
        />
        -->
      </MenuInsert>
    {:else}
      <MenuInsert>
        <h3 class="heading">{$_("authSection.premiumUpgrade.heading")}</h3>
        <p class="description">
          {$_("authSection.premiumUpgrade.description")}
        </p>
        <Button
          label={$_("authSection.premiumUpgrade.cta")}
          fullWidth={true}
          premium={true}
          on:click={() => triggerPremiumUpgradeFlow(org)}
        />
        <div class="learnMore">
          <Link toUrl="/help/premium" color={true} on:click={close}>
            {$_("authSection.premiumUpgrade.docs")}
          </Link>
        </div>
      </MenuInsert>
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

<style>
  .premium {
    font-weight: 600;
  }
  .learnMore {
    font-size: 0.8em;
    color: var(--gray);
  }
  .learnMore:hover {
    opacity: 0.7;
  }
  .heading,
  .description {
    margin: 0;
    opacity: 0.8;
  }
</style>
