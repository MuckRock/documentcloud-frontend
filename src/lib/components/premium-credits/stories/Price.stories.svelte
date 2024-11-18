<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Price from "../Price.svelte";

  export const meta = {
    title: "Premium Credits",
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    component: Price,
  };
</script>

<Template let:args>
  <Price {...args} />
</Template>

<Story
  name="Price"
  id="price"
  args={{
    value: 12375,
  }}
/>
