<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import ArrayField from "../ArrayField.svelte";

  let args = {
    name: "arrayField",
    title: "Array Field",
    description: "An array of items",
  };

  export const meta = {
    title: "Add-Ons / Dispatch / Form / Fields / Array Field",
    component: ArrayField,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <ArrayField {...args} />
</Template>

<Story name="Empty" args={{ ...args, count: 0 }} />
<Story
  name="Text Array"
  args={{ ...args, count: 1, items: { type: "string", title: "Foo" } }}
/>
<Story
  name="Number Array"
  args={{ ...args, count: 2, items: { type: "number", title: "Bar" } }}
/>
<Story
  name="Checkbox Array"
  args={{ ...args, count: 3, items: { type: "boolean", title: "Baz" } }}
/>
