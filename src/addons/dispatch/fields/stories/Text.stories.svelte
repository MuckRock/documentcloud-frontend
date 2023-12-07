<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import Text from "../Text.svelte";

  let args = {
    name: "text",
    title: "Text Input",
    description: "Just some text",
    required: false,
    value: "Lorem ipsum dolor sit amet",
  };

  export const meta = {
    title: "Add-Ons / Dispatch / Form / Fields / Text",
    component: Number,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <Text {...args} />
</Template>

<Story name="Optional" {args} />
<Story name="Required" args={{ ...args, required: true }} />
<Story name="Inline" args={{ ...args, inline: true }} />
