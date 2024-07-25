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
    parameters: { layout: "centered" },
  };
</script>

<Story name="Full organization">
  <OrgMenu
    active_org={organization}
    users={usersList.results}
    orgs={organizationsList.results}
  />
</Story>

<Story name="Free org">
  <OrgMenu active_org={freeOrg} />
</Story>

<Story name="Pro org">
  <OrgMenu active_org={proOrg} />
</Story>
