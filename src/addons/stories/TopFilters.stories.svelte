<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import TopFilters from "../browser/TopFilters.svelte";

  const args = {};
</script>

<Meta
  title="Add-Ons / Top filter"
  tags={["autodocs"]}
  parameters={{ layout: "centered" }}
  component={TopFilters}
/>

<Template let:args>
  <TopFilters {...args} />
</Template>

<Story name="Default" {args} />
