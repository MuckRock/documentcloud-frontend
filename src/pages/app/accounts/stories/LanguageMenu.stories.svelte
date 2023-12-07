<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import LanguageMenu from "../LanguageMenu.svelte";

  export const meta = {
    title: "Account Navigation / Menus / Language",
    component: LanguageMenu,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <LanguageMenu {...args} />
</Template>

<Story name="Language" args={{}} />
