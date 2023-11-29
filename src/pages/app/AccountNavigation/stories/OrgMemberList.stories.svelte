<script context="module" lang="ts">
  import { rest } from "msw";
  import { baseApiUrl } from "../../../../api/base.js";
  import orgMembersFixture from "../fixtures/orgMembers.json";

  /* Mock Request Handlers */
  const mockUrl = new URL(`users/`, baseApiUrl).toString();
  export const mockInMyOrg = {
    data: rest.get(mockUrl, (req, res, ctx) =>
      res(ctx.json(orgMembersFixture)),
    ),
    loading: rest.get(mockUrl, (req, res, ctx) => res(ctx.delay("infinite"))),
    error: rest.get(mockUrl, (req, res, ctx) =>
      res(
        ctx.status(400, "Ambiguous Error"),
        ctx.json("Something went horribly wrong."),
      ),
    ),
    empty: rest.get(mockUrl, (req, res, ctx) =>
      res(ctx.json({ next: null, previous: null, results: [] })),
    ),
  };
</script>

<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import OrgMemberList from "../OrgMemberList.svelte";

  const args = { orgId: 1, myId: 4 };
</script>

<Meta
  title="Account Navigation / Menus / Org / Member List"
  component={OrgMemberList}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <OrgMemberList {...args} />
</Template>

<Story
  name="Success"
  {args}
  parameters={{ msw: { handlers: [mockInMyOrg.data] } }}
/>
<Story
  name="Loading"
  {args}
  parameters={{ msw: { handlers: [mockInMyOrg.loading] } }}
/>
<Story
  name="Error"
  {args}
  parameters={{ msw: { handlers: [mockInMyOrg.error] } }}
/>
<Story
  name="Empty"
  {args}
  parameters={{ msw: { handlers: [mockInMyOrg.empty] } }}
/>
