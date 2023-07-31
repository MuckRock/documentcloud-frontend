<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import defaultAddons from "../../fixtures/addons.json";
  import AddOnList from "../AddOnList.svelte";

  const args = {
    items: defaultAddons,
    loading: false,
    error: null,
  };
</script>

<Meta
  title="Add-Ons / Browser / Components / List"
  component={AddOnList}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <AddOnList {...args} />
</Template>

<Story name="With Data" {args} />
<Story name="Empty" args={{ ...args, items: [] }} />
<Story name="Loading" args={{ ...args, loading: true }} />
<Story name="Error" args={{ ...args, error: "An error occurred!" }} />
