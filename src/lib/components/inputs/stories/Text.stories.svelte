<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Text from "../Text.svelte";

  const { Story } = defineMeta({
    title: "Forms / Inputs /Text",
    component: Text,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  });

  const args = {
    name: "textInput",
  };
</script>

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
