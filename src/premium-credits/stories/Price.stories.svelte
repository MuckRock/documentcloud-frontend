<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import Price from "../Price.svelte";
</script>

<Meta
  title="Premium Credits / Price"
  tags={["autodocs"]}
  parameters={{ layout: "centered" }}
  component={Price}
/>

<Template let:args>
  <Price {...args} />
</Template>

<Story
  name="Price"
  args={{
    value: 12375,
  }}
/>
