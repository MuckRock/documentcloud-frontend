<script context="module" lang="ts">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import Text from "../Text.svelte";

  export const meta = {
    title: "Forms / Inputs /Text",
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
  name="With text"
  args={{ name: "text", value: "This is a text field" }}
/>

<Story
  name="With Placeholder"
  args={{ ...args, placeholder: "Enter some text…" }}
/>

<Story
  name="Disabled"
  args={{ ...args, value: "This is disabled", disabled: true }}
/>
