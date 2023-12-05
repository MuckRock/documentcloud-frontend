<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import HelpMenu from "../HelpMenu.svelte";
</script>

<Meta
  title="Account Navigation / Menus / Help"
  component={HelpMenu}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <HelpMenu {...args} />
</Template>

<Story name="Help" args={{}} />
