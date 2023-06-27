<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import { loadedData } from "../fixtures/AddOnList.ts";
  import defaultAddons from "../fixtures/addons.json";
  import AddOnList from "../browser/AddOnList.svelte";

  const args = {
    items: loadedData,
    loading: false,
    error: null,
  };
</script>

<style>
  .container {
    max-width: 32rem;
    border: 1px solid #eee;
  }
</style>

<Meta
  title="Add-Ons / Browser / List"
  component={AddOnList}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <div class="container">
    <AddOnList {...args} />
  </div>
</Template>

<Story name="With Data" {args} />
<Story name="Empty" args={{ ...args, items: [] }} />
<Story name="Loading" args={{ ...args, items: [], loading: true }} />
<Story
  name="Error"
  args={{ ...args, items: [], error: "An error occurred!" }}
/>

<Story name="Default Add-Ons" args={{ ...args, items: defaultAddons }} />
