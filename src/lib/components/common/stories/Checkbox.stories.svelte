<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Checkbox from "../Checkbox.svelte";

  export const meta = {
    title: "Components / Common / Checkbox",
    component: Checkbox,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <Checkbox {...args} />
</Template>

<Story name="off" />

<Story name="on" args={{ status: "on" }} />

<Story name="some" args={{ status: "some" }} />

<Story name="labeled" args={{ label: "Select all" }} />
