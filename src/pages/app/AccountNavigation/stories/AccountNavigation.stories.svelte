<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import AccountNavigation from "../AccountNavigation.svelte";
</script>

<Meta
  title="Account Navigation"
  component={AccountNavigation}
  parameters={{ layout: "fullscreen" }}
/>

<Template let:args>
  <AccountNavigation {...args} />
</Template>

<Story name="Default" args={{}} />
