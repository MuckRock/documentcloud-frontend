<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import HelpMenu from "../HelpMenu.svelte";

  export const meta = {
    title: "Account Navigation / Menus / Help",
    component: HelpMenu,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <HelpMenu {...args} />
</Template>

<Story name="Help" args={{}} />
