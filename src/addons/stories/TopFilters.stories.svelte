<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";

  import TopFilters from "../TopFilters.svelte";

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
