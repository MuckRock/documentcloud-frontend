<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import OrgMenu from "../OrgMenu.svelte";

  import {
    organization,
    organizationsList,
    usersList,
    proOrg,
    freeOrg,
    me,
  } from "@/test/fixtures/accounts";
  import { inMyOrg } from "$lib/api/accounts";

  const { Story } = defineMeta({
    title: "Navigation / Org Menu",
    component: OrgMenu,
  });
</script>

<Story name="Full organization" asChild>
  <div>
    <OrgMenu
      active_org={organization}
      users={inMyOrg(organization.id, me.id, usersList.results)}
      orgs={organizationsList.results}
    />
  </div>
</Story>

<Story name="Free org" asChild>
  <div>
    <OrgMenu active_org={freeOrg} orgs={organizationsList.results} />
  </div>
</Story>

<Story name="No other orgs" asChild>
  <div>
    <OrgMenu active_org={freeOrg} orgs={[freeOrg]} />
  </div>
</Story>

<Story name="Pro org" asChild>
  <div>
    <OrgMenu active_org={proOrg} orgs={organizationsList.results} />
  </div>
</Story>

<style>
  div {
    max-width: 20rem;
  }
</style>
