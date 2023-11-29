<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Premium from "../Premium.svelte";

  import * as addons from "../../fixtures/addons.json";

  const individualOrg = {
    id: 4,
    avatar_url:
      "https://cdn.muckrock.com/media/account_images/allan-headshot-2016.jpg",
    individual: true,
    name: "lasser.allan",
    slug: "lasserallan",
    monthly_credits: 2500,
    purchased_credits: 3000,
    credit_reset_date: "2023-11-28",
    monthly_credit_allowance: 2500,
    plan: "Professional",
  };

  const groupOrg = {
    id: 1,
    avatar_url:
      "https://squarelet-staging.s3.amazonaws.com/media/org_avatars/logo_uEHCMva.png",
    individual: false,
    name: "MuckRock",
    slug: "muckrock",
    monthly_credits: 5000,
    purchased_credits: 0,
    credit_reset_date: "2023-11-28",
    monthly_credit_allowance: 5000,
    plan: "Organization",
  };

  const user = {
    id: 4,
    avatar_url:
      "https://cdn.muckrock.com/media/account_images/allan-headshot-2016.jpg",
    name: "Allan Lasser",
    organization: groupOrg,
    organizations: [1, 4],
    admin_organizations: [4],
    username: "lasser.allan",
    verified_journalist: true,
  };
</script>

<Meta
  title="Add-Ons / Dispatch / Premium"
  component={Premium}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <Premium {...args} />
</Template>

<Story
  name="Premium Individual Org"
  args={{ addon: addons[7], user: { ...user, organization: individualOrg } }}
/>
<Story
  name="Free Individual Org"
  args={{
    addon: addons[7],
    user: { ...user, organization: { ...individualOrg, plan: "Free" } },
  }}
/>
<Story
  name="Premium Group Org, Admin"
  args={{
    addon: addons[7],
    user: {
      ...user,
      organization: groupOrg,
      admin_organizations: [groupOrg.id],
    },
  }}
/>
<Story
  name="Free Group Org, Admin"
  args={{
    addon: addons[7],
    user: {
      ...user,
      organization: { ...groupOrg, plan: "Free" },
      admin_organizations: [groupOrg.id],
    },
  }}
/>
<Story
  name="Premium Group Org, Member"
  args={{ addon: addons[7], user: { ...user, organization: groupOrg } }}
/>
<Story
  name="Free Group Org, Member"
  args={{
    addon: addons[7],
    user: { ...user, organization: { ...groupOrg, plan: "Free" } },
  }}
/>
<Story
  name="Without Credits"
  args={{
    addon: addons[7],
    user: { ...user, organization: { ...groupOrg, monthly_credits: 0 } },
  }}
/>
<Story
  name="Azure"
  args={{ addon: addons[8], user: { ...user, organization: individualOrg } }}
/>
<Story
  name="GPT"
  args={{ addon: addons[9], user: { ...user, organization: individualOrg } }}
/>
