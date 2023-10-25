<script context="module" lang="ts">
  import { rest } from "msw";
  import { baseApiUrl } from "../../../../api/base.js";
  import { mockInMyOrg } from "./OrgMemberList.stories.svelte";
  import {
    mockGetOrgsList,
    mockChangeOrg,
    mockGetOrg,
  } from "./OrgMenu.stories.svelte";
  import getMeFixture from "../fixtures/getMe.json";

  /* Mock Request Handlers */
  const mockUrl = new URL(`users/me/`, baseApiUrl).toString();
  export const mockGetMe = {
    data: rest.get(mockUrl, (req, res, ctx) => res(ctx.json(getMeFixture))),
    noOrgs: rest.get(mockUrl, (req, res, ctx) =>
      res(ctx.json({ ...getMeFixture, organization: "4" })),
    ),
    loading: rest.get(mockUrl, (req, res, ctx) => res(ctx.delay("infinite"))),
    error: rest.get(mockUrl, (req, res, ctx) =>
      res(ctx.status(404, "Not Found"), ctx.json({ detail: "Not found." })),
    ),
  };
</script>

<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import AccountNavigation from "../AccountNavigation.svelte";
</script>

<Meta
  title="Account Navigation"
  component={AccountNavigation}
  parameters={{ layout: "fullscreen" }}
/>

<Template let:args>
  <AccountNavigation {...args} />
</Template>

<Story
  name="Success"
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
<Story
  name="Signed Out"
  parameters={{ msw: { handlers: [mockGetMe.error] } }}
/>
<Story
  name="No Orgs"
  parameters={{
    msw: {
      handlers: [mockGetMe.noOrgs, mockGetOrg.data, mockGetOrgsList.empty],
    },
  }}
/>
