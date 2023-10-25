<script context="module" lang="ts">
  import { rest } from "msw";
  import { baseApiUrl } from "../../../../api/base.js";
  import { mockInMyOrg } from "./OrgMemberList.stories.svelte";
  import orgListFixture from "../fixtures/orgList.json";
  import getMeFixture from "../fixtures/orgList.json";

  /* Mock Request Handlers */
  const mockGetOrgsUrl = new URL(`organizations/`, baseApiUrl).toString();
  export const mockGetOrgsList = {
    data: rest.get(mockGetOrgsUrl, (req, res, ctx) =>
      res(ctx.json(orgListFixture)),
    ),
    loading: rest.get(mockGetOrgsUrl, (req, res, ctx) =>
      res(ctx.delay("infinite")),
    ),
    error: rest.get(mockGetOrgsUrl, (req, res, ctx) =>
      res(
        ctx.status(400, "Ambiguous Error"),
        ctx.json("Something went horribly wrong."),
      ),
    ),
    empty: rest.get(mockGetOrgsUrl, (req, res, ctx) =>
      res(
        ctx.json({
          next: null,
          previous: null,
          results: [
            {
              id: 4,
              avatar_url:
                "https://cdn.muckrock.com/media/account_images/allan-headshot-2016.jpg",
              individual: true,
              monthly_ai_credits: 2000,
              number_ai_credits: 0,
              name: "lasser.allan",
              slug: "lasserallan",
            },
          ],
        }),
      ),
    ),
  };

  const mockGetOrgUrl = new URL(`organizations/:id/*`, baseApiUrl).toString();
  export const mockGetOrg = {
    data: rest.get(mockGetOrgUrl, (req, res, ctx) =>
      res(
        ctx.json(
          orgListFixture.results.find(
            ({ id }) => id.toString() === req.params.id,
          ),
        ),
      ),
    ),
    loading: rest.get(mockGetOrgUrl, (req, res, ctx) =>
      res(ctx.delay("infinite")),
    ),
    error: rest.get(mockGetOrgUrl, (req, res, ctx) =>
      res(
        ctx.status(400, "Ambiguous Error"),
        ctx.json("Something went horribly wrong."),
      ),
    ),
    empty: rest.get(mockGetOrgUrl, (req, res, ctx) =>
      res(ctx.json({ next: null, previous: null, results: [] })),
    ),
  };

  const mockChangeOrgUrl = new URL(`users/me/`, baseApiUrl).toString();
  export const mockChangeOrg = rest.patch(mockChangeOrgUrl, (req, res, ctx) =>
    res(ctx.json(getMeFixture)),
  );
</script>

<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import OrgMenu from "../OrgMenu.svelte";

  const args = {
    user: {
      id: 4,
    },
    org: {
      id: 1,
      avatar_url: "https://cdn.muckrock.com/media/org_avatars/logo.png",
      individual: false,
      monthly_ai_credits: 10000,
      number_ai_credits: 0,
      name: "MuckRock",
      slug: "muckrock",
    },
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
