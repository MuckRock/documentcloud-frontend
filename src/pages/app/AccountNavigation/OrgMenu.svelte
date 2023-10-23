<script lang="ts" context="module">
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";
  import Organization16 from "svelte-octicons/lib/Organization16.svelte";

  import Dropdown from "../../../common/Dropdown.svelte";
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

  export let user: User;
  export let activeOrg: Org;

  async function getActiveOrg(id) {
    if (id === activeOrg.id) return activeOrg;
    return getOrganization(id);
  }

  async function getUserOrgsList(user) {
    const orgs = await getOrganizationsByIds(user.organizations);
    return orgs;
  }

  async function changeOrg(id) {
    changeActiveOrg(id);
    getActiveOrg(id);
  }

  let activeOrgPromise = getActiveOrg(activeOrg.id);
  let orgListPromise = getUserOrgsList(user);
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

{#await activeOrgPromise}
  <Dropdown name="organization" fixed={true}>
    <MenuTitle slot="title" label="Loading…">
      <Loader active center slot="icon" />
    </MenuTitle>
    <Menu>
      <p>Getting org data…</p>
    </Menu>
  </Dropdown>
{:then activeOrg}
  <Dropdown name="organization" fixed={true}>
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
      {#await orgListPromise}
        <OrgPicker {activeOrg} loading={true} />
      {:then orgOptions}
        <OrgPicker {activeOrg} {orgOptions} handleChange={changeOrg} />
      {/await}
    </Menu>
  </Dropdown>
{/await}
