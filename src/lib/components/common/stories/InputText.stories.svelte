<script context="module" lang="ts">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import InputText from "../InputText.svelte";

  export const meta = {
    title: "Components / Common / Inputs / Text",
    component: InputText,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  let args = {
    name: "textInput",
  };
</script>

<Template let:args>
  <InputText {...args} />
</Template>

<Story name="Empty" {args} />
<Story
  name="With Placeholder"
  args={{ ...args, placeholder: "Enter some text…" }}
/>
