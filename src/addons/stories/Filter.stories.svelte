<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Filter from "../browser/Filter.svelte";
  import Pin from "../../common/Pin.svelte";

  let args = { selected: false, name: "Pinned"};
</script>

<Meta
  title="Add-Ons / Browser / Filter"
  tags={["autodocs"]}
  parameters={{ layout: "centered" }}
  component={Filter}
  argTypes={{selected: {control: "boolean"}}}
/>

<Template let:args>
  <Filter {...args}>
    <Pin slot="icon" />
  </Filter>
</Template>

<Story name="Default" {args} />
<Story name="Selected" args={{...args, selected: true}} />
