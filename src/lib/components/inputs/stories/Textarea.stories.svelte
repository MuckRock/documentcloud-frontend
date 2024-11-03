<script context="module" lang="ts">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import TextArea from "../TextArea.svelte";

  export const meta = {
    title: "Components / Inputs / TextArea",
    component: TextArea,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  let args = {
    name: "textInput",
    value: "",
  };
</script>

<Template let:args>
  <div><TextArea {...args} /></div>
</Template>

<Story name="Empty" {args} />

<Story
  name="With content"
  args={{ ...args, value: "This is some text\nwith multiple lines" }}
/>

<style>
  div {
    width: 24rem;
  }
</style>
