<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import PremiumMenu from "../PremiumMenu.svelte";
</script>

<Meta
  title="Account Navigation / Menus / Premium"
  component={PremiumMenu}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <PremiumMenu {...args} />
</Template>

<Story name="Premium User" args={{ isPremium: true }} />
<Story name="Free User" args={{ isPremium: false }} />
