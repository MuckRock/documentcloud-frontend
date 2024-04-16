<script context="module" lang="ts">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import Text from "../Text.svelte";

  export const meta = {
    title: "Components / Inputs / Text",
    component: Text,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  let args = {
    name: "textInput",
  };
</script>

<Template let:args>
  <Text {...args} />
</Template>

<Story name="Empty" {args} />
<Story
  name="With Placeholder"
  args={{ ...args, placeholder: "Enter some text…" }}
/>
