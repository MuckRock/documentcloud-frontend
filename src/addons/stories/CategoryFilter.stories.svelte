<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import CategoryFilter from "../browser/CategoryFilter.svelte";

  const args = {};
</script>

<Meta
  title="Add-Ons / Browser / Filters / Category"
  tags={["autodocs"]}
  parameters={{ layout: "centered" }}
  component={CategoryFilter}
/>

<Template let:args>
  <CategoryFilter {...args} />
</Template>

<Story name="Category" {args} />
