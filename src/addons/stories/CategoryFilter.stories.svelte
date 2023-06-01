<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";

  import CategoryFilter from "../CategoryFilter.svelte";

  const args = {};
</script>

<Meta
  title="Add-Ons / Category filter"
  tags={["autodocs"]}
  parameters={{ layout: "centered" }}
  component={CategoryFilter}
/>

<Template let:args>
  <CategoryFilter {...args} />
</Template>

<Story name="Default" {args} />
