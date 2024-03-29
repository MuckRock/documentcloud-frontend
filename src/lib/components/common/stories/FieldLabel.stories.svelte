<script context="module" lang="ts">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import FieldLabel from "../FieldLabel.svelte";
  import { Infinity16 } from "svelte-octicons";

  export const meta = {
    title: "Components / Common / Inputs / Field Label",
    component: FieldLabel,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  let args = {
    required: false,
    premium: false,
  };
</script>

<Template let:args>
  <FieldLabel {...args}>Input Label</FieldLabel>
</Template>

<Story name="Default" {args} />
<Story name="With Icon" let:args {args}>
  <FieldLabel {...args}
    ><Infinity16 slot="icon" />Never-Ending Salad & Breadsticks</FieldLabel
  >
</Story>
<Story name="Required" args={{ ...args, required: true }} />
<Story name="Premium" args={{ ...args, premium: true }} />
