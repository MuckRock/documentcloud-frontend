<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import { me, organization } from "@/test/fixtures/accounts";

  import Avatar from "../Avatar.svelte";

  const { Story } = defineMeta({
    title: "Accounts / Avatar",
    component: Avatar,
    parameters: { layout: "centered" },
  });
</script>

<Story name="With Image (User)" args={{ user: me }} />

<Story
  name="Without Image (User)"
  args={{
    user: {
      ...me,
      avatar_url: undefined,
    },
  }}
/>

<Story name="With Image (Org)" args={{ org: organization }} />

<Story
  name="Without Image (Org)"
  args={{
    org: {
      ...organization,
      avatar_url: "",
    },
  }}
/>
