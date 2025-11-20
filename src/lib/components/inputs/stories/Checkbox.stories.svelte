<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Checkbox from "../Checkbox.svelte";

  export const meta = {
    title: "Forms / Inputs /Checkbox",
    component: Checkbox,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <Checkbox {...args} />
</Template>

<Story name="off" />

<Story name="on" args={{ checked: true }} />

<Story name="some" args={{ indeterminate: true }} />

<Story name="labeled" args={{ label: "Select all" }} />
