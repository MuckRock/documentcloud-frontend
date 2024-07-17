<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import AddOnNavigation from "../AddOnsNavigation.svelte";

  export const meta = {
    title: "Add-Ons / Navigation",
    component: AddOnNavigation,
    parameters: { layout: "centered" },
  };

  let args = {
    active: "all",
  };
</script>

<Template let:args>
  <AddOnNavigation {...args} />
</Template>

<Story name="default" {args} />
