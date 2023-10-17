<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import PremiumUpgradeMenu from "../PremiumUpgradeMenu.svelte";
</script>

<Meta
  title="Account Navigation / Menus / Premium Upgrade"
  component={PremiumUpgradeMenu}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <PremiumUpgradeMenu {...args} />
</Template>

<Story name="Premium Upgrade" args={{}} />
