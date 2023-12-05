<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import CreditMeter from "../CreditMeter.svelte";

  let args = {
    id: "meter",
    max: 10000,
    value: 7500,
    label: "Org Allowance",
    helpText: "Monthly credits will reset in 2 weeks",
  };

  export const meta = {
    title: "Premium Credits / Credit Meter",
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    component: CreditMeter,
  };
</script>

<Template let:args>
  <CreditMeter {...args} />
</Template>

<Story name="Org Credits" {args} />

<Story
  name="Pro Credits"
  args={{ ...args, label: "Pro Allowance", max: 5000, value: 3000 }}
/>

<Story
  name="Low Credits"
  args={{ ...args, label: "Pro Allowance", max: 5000, value: 1000 }}
/>

<Story
  name="Purchased Credits"
  args={{
    ...args,
    label: "Purchased Credits",
    value: 1750,
    max: undefined,
    helpText:
      "Purchased credits never expire and will only be used after you run out of monthly credits",
  }}
/>
