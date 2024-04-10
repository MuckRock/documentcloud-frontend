<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Language from "../Language.svelte";

  export const meta = {
    title: "Components / Inputs / Language",
    component: Language,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <Language {...args} />
</Template>

<Story name="default" />
