<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import LanguageMenu from "../LanguageMenu.svelte";
</script>

<Meta
  title="Account Navigation / Menus / Language"
  component={LanguageMenu}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <LanguageMenu {...args} />
</Template>

<Story name="Language" args={{}} />
