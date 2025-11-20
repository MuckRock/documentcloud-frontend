<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import { me, organization } from "@/test/fixtures/accounts";

  import Avatar from "../Avatar.svelte";

  export const meta = {
    title: "Accounts / Avatar",
    component: Avatar,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <Avatar {...args} />
</Template>

<Story name="With Image (User)" args={{ user: me }} />
<Story
  name="Without Image (User)"
  args={{
    user: {
      ...me,
      avatar_url: null,
    },
  }}
/>

<Story name="With Image (Org)" args={{ org: organization }} />
<Story
  name="Without Image (Org)"
  args={{
    org: {
      ...organization,
      avatar_url: null,
    },
  }}
/>
