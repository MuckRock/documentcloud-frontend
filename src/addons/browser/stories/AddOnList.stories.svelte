<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import { addonsList } from "../../../test/fixtures/addons";
  import AddOnList from "../AddOnList.svelte";

  const args = {
    items: addonsList.results,
    loading: false,
    error: null,
  };

  export const meta = {
    title: "Add-Ons / Browser / Components / List",
    component: AddOnList,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <AddOnList {...args} />
</Template>

<Story name="With Data" {args} />
<Story name="Empty" args={{ ...args, items: [] }} />
<Story name="Loading" args={{ ...args, loading: true }} />
<Story name="Error" args={{ ...args, error: "An error occurred!" }} />
