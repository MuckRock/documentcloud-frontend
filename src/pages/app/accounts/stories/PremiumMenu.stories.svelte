<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import PremiumMenu from "../PremiumMenu.svelte";

  import { organizationsList } from "../../../../test/fixtures/accounts";

  export const meta = {
    title: "App / Accounts / Menus / Premium",
    component: PremiumMenu,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <PremiumMenu {...args} />
</Template>

<Story name="Premium User" args={{ org: organizationsList.results[1] }} />
<Story
  name="Free User"
  args={{ org: { ...organizationsList.results[1], plan: "Free" } }}
/>
