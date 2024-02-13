<script lang="ts">
  import { _, locale } from "svelte-i18n";
  import Organization16 from "svelte-octicons/lib/Organization16.svelte";

  import Dropdown from "../../../common/Dropdown2.svelte";
  import Menu from "../../../common/Menu.svelte";
  import MenuTitle from "../../../common/MenuTitle.svelte";
  import Loader from "../../../common/Loader.svelte";
  import type { User, Org } from "../../../api/types/orgAndUser";
  import OrgMemberList from "./OrgMemberList.svelte";
  import {
    changeActive,
    isOrgAdmin,
    isPremiumOrg,
    triggerPremiumUpgradeFlow,
  } from "../../../manager/orgsAndUsers.js";
  import {
    getOrganizationsByIds,
    getOrganization,
  } from "../../../api/orgAndUser";
  import OrgPicker from "./OrgPicker.svelte";
  import PremiumMenu from "./PremiumMenu.svelte";
  import MenuInsert from "../../../common/MenuInsert.svelte";
  import CreditMeter, {
    formatResetDate,
  } from "../../../premium-credits/CreditMeter.svelte";
  import Button from "../../../common/Button.svelte";
  // import { triggerCreditPurchaseFlow } from "../../../manager/orgsAndUsers";
  import Link from "../../../router/Link.svelte";

  export let user: User;
  export let org: Org;

  async function getOrg(id) {
    if (id === org.id) return org;
    org = await getOrganization(id);
    return org;
  }

  async function listUserOrgs(user) {
    const orgs = await getOrganizationsByIds(user.organizations);
    return orgs;
  }

  async function changeOrg(org) {
    changeActive(org);
    getOrgPromise = getOrg(org.id);
  }

  let getOrgPromise = getOrg(org.id);
  let listOrgsPromise = listUserOrgs(user);
</script>

{#await getOrgPromise}
  <Dropdown id="organization">
    <MenuTitle slot="title" label="Loading…">
      <Loader active center slot="icon" />
    </MenuTitle>
    <Menu>
      <p>Getting org data…</p>
    </Menu>
  </Dropdown>
{:then activeOrg}
  {#if activeOrg.individual === true}
    <PremiumMenu org={activeOrg}>
      {#await listOrgsPromise then orgOptions}
        {#if orgOptions.length > 1}
          <OrgPicker {activeOrg} {orgOptions} handleChange={changeOrg} />
        {/if}
      {/await}
    </PremiumMenu>
  {:else}
    <Dropdown id="organization">
      <MenuTitle slot="title" label={activeOrg.name}>
        <span slot="icon">
          {#if activeOrg.avatar_url}
            <img src={activeOrg.avatar_url} class="orgAvatar" alt="" />
          {:else}
            <div class="orgIcon"><Organization16 /></div>
          {/if}
        </span>
      </MenuTitle>
      <Menu>
        <div class="medium-width">
          {#if isPremiumOrg(activeOrg)}
            <MenuInsert>
              <CreditMeter
                id="org-credits"
                label={$_("authSection.credits.monthlyOrg")}
                helpText={$_("authSection.credits.refreshOn", {
                  values: {
                    date: formatResetDate(activeOrg.credit_reset_date, $locale),
                  },
                })}
                value={activeOrg.monthly_credits}
                max={activeOrg.monthly_credit_allowance}
              />
              <!-- TODO: Support credit purchases (#342)
          <CreditMeter
            id="purchased-credits"
            label={$_("authSection.credits.purchased")}
            helpText={$_("authSection.credits.purchasedHelpText")}
            value={activeOrg.purchased_credits}
          />
          {#if user.admin_organizations.includes(activeOrg.id)}
            <Button
              premium
              fullWidth={true}
              label={$_("authSection.credits.purchaseCreditsButton")}
              on:click={triggerCreditPurchaseFlow}
            />
          {:else}
            <p class="helpText">
              {$_("authSection.credits.purchaseCreditsAdminOnly")}
            </p>
          {/if} -->
            </MenuInsert>
          {:else if isOrgAdmin(user)}
            <MenuInsert>
              <div class="freeOrg">
                <h3 class="heading">
                  {$_("authSection.premiumUpgrade.orgHeading")}
                </h3>
                <p class="description">
                  {$_("authSection.premiumUpgrade.orgDescription")}
                </p>
                <Button
                  label={$_("authSection.premiumUpgrade.cta")}
                  fullWidth={true}
                  premium={true}
                  on:click={() => triggerPremiumUpgradeFlow(activeOrg)}
                />
                <div class="learnMore">
                  <Link toUrl="/help/premium" color={true} on:click={close}>
                    {$_("authSection.premiumUpgrade.docs")}
                  </Link>
                </div>
              </div>
            </MenuInsert>
          {/if}
          <OrgMemberList orgId={activeOrg.id} myId={user.id} />
          {#await listOrgsPromise then orgOptions}
            {#if orgOptions.length > 1}
              <OrgPicker {activeOrg} {orgOptions} handleChange={changeOrg} />
            {/if}
          {/await}
        </div>
      </Menu>
    </Dropdown>
  {/if}
{/await}

<style>
  .orgAvatar {
    height: 1.5rem;
    width: 1.5rem;
    display: block;
  }
  .orgIcon {
    height: 1.5rem;
    width: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .helpText {
    width: 100%;
    font-size: 0.875em;
    color: var(--gray);
    margin: 0;
  }
  .medium-width {
    min-width: 20rem;
  }
</style>
