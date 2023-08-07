<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Text from "../Text.svelte";

  let args = {
    name: "text",
    title: "Text Input",
    description: "Just some text",
    required: false,
    value: "Lorem ipsum dolor sit amet",
  };
</script>

<Meta
  title="Add-Ons / Dispatch / Form / Fields / Text"
  component={Number}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <Text {...args} />
</Template>

<Story name="Optional" {args} />
<Story name="Required" args={{ ...args, required: true }} />
<Story name="Inline" args={{ ...args, inline: true }} />
