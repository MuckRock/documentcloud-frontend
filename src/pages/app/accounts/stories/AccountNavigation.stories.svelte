<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import {
    mockGetMe,
    mockInMyOrg,
    mockGetOrgsList,
    mockChangeOrg,
    mockGetOrg,
  } from "./mockData";

  import AccountNavigation from "../AccountNavigation.svelte";

  export const meta = {
    title: "App / Accounts",
    component: AccountNavigation,
    parameters: { layout: "fullscreen" },
  };
</script>

<Template let:args>
  <AccountNavigation {...args} />
</Template>

<Story
  name="Pro User, Org Admin"
  parameters={{
    msw: {
      handlers: [
        mockGetMe.orgAdmin,
        mockGetOrg.data,
        mockInMyOrg.data,
        mockGetOrgsList.data,
        mockChangeOrg,
      ],
    },
  }}
/>

<Story
  name="Pro User, Org Member"
  parameters={{
    msw: {
      handlers: [
        mockGetMe.data,
        mockGetOrgsList.data,
        mockInMyOrg.data,
        mockChangeOrg,
        mockGetOrg.data,
      ],
    },
  }}
/>

<Story
  name="Pro User, No Orgs"
  parameters={{
    msw: {
      handlers: [mockGetMe.noOrgs, mockGetOrg.pro, mockGetOrgsList.empty],
    },
  }}
/>

<Story
  name="Free User, No Orgs"
  parameters={{
    msw: {
      handlers: [mockGetMe.noOrgs, mockGetOrg.free, mockGetOrgsList.empty],
    },
  }}
/>

<Story
  name="Signed Out"
  parameters={{ msw: { handlers: [mockGetMe.error] } }}
/>

<Story
  name="Loading"
  parameters={{
    msw: {
      handlers: [
        mockGetMe.loading,
        mockGetOrgsList.loading,
        mockInMyOrg.loading,
      ],
    },
  }}
/>
