<script context="module" lang="ts">
  import { rest } from "msw";
  import { baseApiUrl } from "../../../../api/base.js";
  import { mockInMyOrg } from "./OrgMemberList.stories.svelte";
  import orgListFixture from "../fixtures/orgList.json";

  /* Mock Request Handlers */
  const mockUrl = new URL(`organizations/`, baseApiUrl).toString();
  export const mockGetOrgsList = {
    data: rest.get(mockUrl, (req, res, ctx) => res(ctx.json(orgListFixture))),
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
  import { action } from "@storybook/addon-actions";
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import OrgMenu from "../OrgMenu.svelte";

  const args = {
    user: {
      id: 4,
    },
    activeOrg: {
      id: 1,
      avatar_url: "https://cdn.muckrock.com/media/org_avatars/logo.png",
      individual: false,
      monthly_ai_credits: 10000,
      number_ai_credits: 0,
      name: "MuckRock",
      slug: "muckrock",
    },
    userOrgs: [1, 2],
    changeOrg: action("Change Org"),
  };
</script>

<Meta
  title="Account Navigation / Menus / Org"
  component={OrgMenu}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <OrgMenu {...args} />
</Template>

<Story
  name="Success"
  {args}
  parameters={{ msw: { handlers: [mockInMyOrg.data, mockGetOrgsList.data] } }}
/>
<Story
  name="Loading"
  {args}
  parameters={{
    msw: { handlers: [mockInMyOrg.loading, mockGetOrgsList.loading] },
  }}
/>
<Story
  name="Without Avatar"
  args={{ ...args, activeOrg: { ...args.activeOrg, avatar_url: "" } }}
  parameters={{ msw: { handlers: [mockInMyOrg.data, mockGetOrgsList.data] } }}
/>
