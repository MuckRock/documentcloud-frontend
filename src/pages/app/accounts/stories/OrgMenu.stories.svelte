<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import orgListFixture from "../fixtures/orgList.json";
  import getMeFixture from "../fixtures/getMe.json";

  import OrgMenu from "../OrgMenu.svelte";
  import {
    mockChangeOrg,
    mockGetOrg,
    mockGetOrgsList,
    mockInMyOrg,
  } from "./mockData";

  const args = {
    user: getMeFixture,
    org: orgListFixture.results[0],
  };

  export const meta = {
    title: "Account Navigation / Menus / Org",
    component: OrgMenu,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <OrgMenu {...args} />
</Template>

<Story
  name="Success"
  {args}
  parameters={{
    msw: {
      handlers: [
        mockInMyOrg.data,
        mockGetOrgsList.data,
        mockGetOrg.data,
        mockChangeOrg,
      ],
    },
  }}
/>
<Story
  name="Loading"
  {args}
  parameters={{
    msw: {
      handlers: [
        mockInMyOrg.loading,
        mockGetOrgsList.loading,
        mockGetOrg.loading,
        mockChangeOrg,
      ],
    },
  }}
/>
<Story
  name="Without Avatar"
  args={{ ...args, org: { ...args.org, avatar_url: "" } }}
  parameters={{
    msw: {
      handlers: [
        mockInMyOrg.data,
        mockGetOrgsList.data,
        mockGetOrg.data,
        mockChangeOrg,
      ],
    },
  }}
/>
<Story
  name="Free Org Member"
  args={{ ...args, org: { ...args.org, plan: "Free" } }}
  parameters={{
    msw: {
      handlers: [
        mockInMyOrg.data,
        mockGetOrgsList.data,
        mockGetOrg.data,
        mockChangeOrg,
      ],
    },
  }}
/>
<Story
  name="Free Org Admin"
  args={{
    ...args,
    user: {
      ...args.user,
      admin_organizations: [...args.user.admin_organizations, args.org.id],
    },
    org: { ...args.org, plan: "Free" },
  }}
  parameters={{
    msw: {
      handlers: [
        mockInMyOrg.data,
        mockGetOrgsList.data,
        mockGetOrg.data,
        mockChangeOrg,
      ],
    },
  }}
/>
