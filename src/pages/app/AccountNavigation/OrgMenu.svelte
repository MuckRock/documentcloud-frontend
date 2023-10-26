<script lang="ts">
  import { _ } from "svelte-i18n";
  import Organization16 from "svelte-octicons/lib/Organization16.svelte";

  import Dropdown from "../../../common/Dropdown2.svelte";
  import Menu from "../../../common/Menu.svelte";
  import MenuTitle from "../../../common/MenuTitle.svelte";
  import Loader from "../../../common/Loader.svelte";
  import { User, Org } from "./types";
  import OrgMemberList from "./OrgMemberList.svelte";
  import {
    getOrganizationsByIds,
    changeActiveOrg,
    getOrganization,
  } from "../../../api/orgAndUser";
  import OrgPicker from "./OrgPicker.svelte";
  import PremiumMenu from "./PremiumMenu.svelte";
  import MenuInsert from "../../../common/MenuInsert.svelte";
  import CreditMeter from "../../../premium-credits/CreditMeter.svelte";
  import Button from "../../../common/Button.svelte";

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

  async function changeOrg(id) {
    changeActiveOrg(id);
    getOrgPromise = getOrg(id);
  }

  // TODO: Handle flow for purchasing premium credits
  async function triggerCreditPurchaseFlow() {
    alert("Purchase Credits!");
  }

  let getOrgPromise = getOrg(org.id);
  let listOrgsPromise = listUserOrgs(user);
</script>

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
</style>

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
        <MenuInsert>
          <CreditMeter
            id="org-credits"
            label="Org Allowance"
            helpText="Credits will reset in 2 weeks"
            value={activeOrg.monthly_credits.remaining}
            max={activeOrg.monthly_credits.allowance}
          />
          <CreditMeter
            id="purchased-credits"
            label="Purchased Credits"
            helpText="Purchased credits never expire and will only be used after you run out of monthly credits."
            value={activeOrg.purchased_credits}
          />
          {#if user.admin_organizations.includes(activeOrg.id)}
            <Button
              premium={true}
              fullWidth={true}
              label="Purchase Credits"
              on:click={triggerCreditPurchaseFlow}
            />
          {:else}
            <p class="helpText">
              Only org admins may purchase additional credits.
            </p>
          {/if}
        </MenuInsert>
        <OrgMemberList orgId={activeOrg.id} myId={user.id} />
        {#await listOrgsPromise then orgOptions}
          {#if orgOptions.length > 1}
            <OrgPicker {activeOrg} {orgOptions} handleChange={changeOrg} />
          {/if}
        {/await}
      </Menu>
    </Dropdown>
  {/if}
{/await}
