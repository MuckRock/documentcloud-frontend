<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import Checkbox from "../Checkbox.svelte";

  let args = {
    name: "checkbox",
    title: "Checkbox",
    description: "Check to confirm",
    required: false,
    value: true,
  };

  export const meta = {
    title: "Add-Ons / Dispatch / Form / Fields / Checkbox",
    component: Checkbox,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <Checkbox {...args} />
</Template>

<Story name="Checked" {args} />
<Story name="Unchecked" args={{ ...args, value: false }} />
<Story name="Required" args={{ ...args, required: true }} />
