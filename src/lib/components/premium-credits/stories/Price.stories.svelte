<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Price from "../Price.svelte";

  const { Story } = defineMeta({
    title: "Premium Credits",
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    component: Price,
  });
</script>

<Story
  name="Price"
  args={{
    value: 12375,
  }}
/>
