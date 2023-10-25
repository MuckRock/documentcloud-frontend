<script lang="ts" context="module">
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";
  import Organization16 from "svelte-octicons/lib/Organization16.svelte";

  import Dropdown from "../../../common/Dropdown2.svelte";
  import Menu from "../../../common/Menu.svelte";
  import MenuItem from "../../../common/MenuItem.svelte";
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

  let getOrgPromise = getOrg(org.id);
  let listOrgsPromise = listUserOrgs(user);

  // TODO: include user plan information in payload
  // @ts-expect-error unimplemented "plan" property
  $: isPremium = org.individual && org.plan === "Professional";
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
  {#if activeOrg.individual}
    <PremiumMenu {isPremium}>
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
