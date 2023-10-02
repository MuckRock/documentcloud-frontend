<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Filter from "../Filter.svelte";
  import FilterDemo from "./Filter.demo.svelte";

  let args = { selected: false, name: "Pinned" };
</script>

<Meta
  title="Add-Ons / Browser / Components / Filter"
  tags={["autodocs"]}
  parameters={{ layout: "centered" }}
  component={Filter}
  argTypes={{ selected: { control: "boolean" } }}
/>

<Template let:args>
  <FilterDemo {args} />
</Template>

<Story name="Default" {args} />
<Story name="Selected" args={{ ...args, selected: true }} />
