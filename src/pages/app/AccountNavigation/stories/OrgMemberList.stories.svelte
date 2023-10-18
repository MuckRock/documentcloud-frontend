<script>
  import { rest } from "msw";
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import OrgMemberList from "../OrgMemberList.svelte";
  import orgMembersFixture from "../fixtures/orgMembers.json";
  import { baseApiUrl } from "../../../../api/base.js";

  const args = { orgId: 1, myId: 4 };
  const mockUrl = new URL(`users/`, baseApiUrl).toString();
  /* Mock Request Handlers */
  const data = rest.get(mockUrl, (req, res, ctx) =>
    res(ctx.json(orgMembersFixture)),
  );
  const loading = rest.get(mockUrl, (req, res, ctx) =>
    res(ctx.delay("infinite")),
  );
  const error = rest.get(mockUrl, (req, res, ctx) =>
    res(
      ctx.status(400, "Ambiguous Error"),
      ctx.json("Something went horribly wrong."),
    ),
  );
  const empty = rest.get(mockUrl, (req, res, ctx) =>
    res(ctx.json({ next: null, previous: null, results: [] })),
  );
</script>

<Meta
  title="Account Navigation / Menus / Org / Member List"
  component={OrgMemberList}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <OrgMemberList {...args} />
</Template>

<Story name="Success" {args} parameters={{ msw: { handlers: [data] } }} />
<Story name="Loading" {args} parameters={{ msw: { handlers: [loading] } }} />
<Story name="Error" {args} parameters={{ msw: { handlers: [error] } }} />
<Story name="Empty" {args} parameters={{ msw: { handlers: [empty] } }} />
