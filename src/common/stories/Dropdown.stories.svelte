<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Dropdown from "./Dropdown.demo.svelte";

  const args = {};
</script>

<Meta
  title="Common / Dropdown"
  tags={["autodocs"]}
  component={Dropdown}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <Dropdown {...args} />
</Template>

<Story name="Default" {args} />
<Story name="Without Overlay" args={{ ...args, overlay: false }} />
