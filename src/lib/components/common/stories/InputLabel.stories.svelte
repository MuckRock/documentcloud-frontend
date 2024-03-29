<script context="module" lang="ts">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import InputLabel from "../InputLabel.svelte";
  import { Infinity16 } from "svelte-octicons";

  export const meta = {
    title: "Components / Common / Inputs / Label",
    component: InputLabel,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  let args = {
    required: false,
    premium: false,
  };
</script>

<Template let:args>
  <InputLabel {...args}>Input Label</InputLabel>
</Template>

<Story name="Default" {args} />
<Story name="With Icon" let:args {args}>
  <InputLabel {...args}
    ><Infinity16 slot="icon" />Never-Ending Salad & Breadsticks</InputLabel
  >
</Story>
<Story name="Required" args={{ ...args, required: true }} />
<Story name="Premium" args={{ ...args, premium: true }} />
