<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import { me } from "@/test/fixtures/accounts";

  import UserAvatar from "../UserAvatar.svelte";

  export const meta = {
    title: "Components / Accounts / User Avatar",
    component: UserAvatar,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <UserAvatar {...args} />
</Template>

<Story name="With Image" args={{ user: me }} />
<Story
  name="Without Image"
  args={{
    user: {
      ...me,
      avatar_url: null,
    },
  }}
/>
