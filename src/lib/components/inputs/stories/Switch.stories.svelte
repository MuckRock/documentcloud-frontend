<script context="module" lang="ts">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import Switch from "../Switch.svelte";

  export const meta = {
    title: "Forms / Inputs /Switch",
    component: Switch,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  let args = {
    checked: false,
    disabled: false,
  };
</script>

<Template let:args>
  <Switch {...args} />
</Template>

<Story name="Off" {args} />
<Story name="On" args={{ ...args, checked: true }} />
<Story name="Disabled" args={{ ...args, disabled: true }} />
