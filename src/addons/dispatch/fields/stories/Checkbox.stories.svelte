<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Checkbox from "../Checkbox.svelte";

  let args = {
    name: "checkbox",
    title: "Checkbox",
    description: "An array of items",
    required: false,
    value: true,
  };
</script>

<Meta
  title="Add-Ons / Dispatch / Form / Fields / Checkbox"
  component={Checkbox}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <Checkbox {...args} />
</Template>

<Story name="Checked" {args} />
<Story name="Unchecked" args={{ ...args, value: false }} />
<Story name="Required" args={{ ...args, required: true }} />
