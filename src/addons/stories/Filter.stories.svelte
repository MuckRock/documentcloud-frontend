<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Filter from "../browser/Filter.svelte";
  import Star from "../../common/icons/Star.svelte";

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
    <Star slot="icon" />
  </Filter>
</Template>

<Story name="Default" {args} />
<Story name="Selected" args={{...args, selected: true}} />
