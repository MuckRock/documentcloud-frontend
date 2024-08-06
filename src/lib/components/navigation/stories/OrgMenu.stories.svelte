<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import OrgMenu from "../OrgMenu.svelte";

  import {
    organization,
    organizationsList,
    usersList,
    proOrg,
    freeOrg,
  } from "@/test/fixtures/accounts";

  export const meta = {
    title: "Components / Navigation / Org Menu",
    component: OrgMenu,
  };
</script>

<Story name="Full organization">
  <div>
    <OrgMenu
      active_org={organization}
      users={usersList.results}
      orgs={organizationsList.results}
    />
  </div>
</Story>

<Story name="Free org">
  <div>
    <OrgMenu active_org={freeOrg} orgs={organizationsList.results} />
  </div>
</Story>

<Story name="Pro org">
  <div>
    <OrgMenu active_org={proOrg} orgs={organizationsList.results} />
  </div>
</Story>

<style>
  div {
    max-width: 20rem;
  }
</style>
