<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Filters from "../browser/Filters.svelte";

  const args = {};
</script>

<Meta
  title="Add-Ons / Browser / Filters"
  tags={["autodocs"]}
  parameters={{ layout: "centered" }}
  component={Filters}
/>

<Template let:args>
  <Filters {...args} />
</Template>

<Story name="Filters" {args} />
