<script lang="ts" context="module">
  import { activeAddons } from "@/test/fixtures/addons";
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import AddOns from "../AddOns.svelte";
  import type { Meta } from "@storybook/svelte";

  export const meta: Meta = {
    title: "Components / Common / Add-Ons",
    component: AddOns,
    parameters: { layout: "centered" },
  };

  let args = {
    pinnedAddOns: Promise.resolve(activeAddons),
  };
</script>

<Template let:args>
  <AddOns {...args} />
</Template>

<Story
  name="Empty"
  args={{ pinnedAddOns: Promise.resolve({ results: [], count: 0 }) }}
/>
<Story name="Loading" args={{ pinnedAddOns: new Promise(() => {}) }} />
<Story name="With Data" {args} />
<Story
  name="With Error"
  args={{ pinnedAddOns: Promise.reject("Something went wrong") }}
/>
