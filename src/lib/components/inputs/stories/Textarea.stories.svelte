<script module lang="ts">
  import type { ComponentProps } from "svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TextArea from "../TextArea.svelte";

  const { Story } = defineMeta({
    title: "Forms / Inputs /TextArea",
    component: TextArea,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    render: template,
  });

  type Args = ComponentProps<typeof TextArea>;

  const args = {
    name: "textInput",
    value: "",
  };
</script>

{#snippet template(args: Args)}
  <div><TextArea {...args} /></div>
{/snippet}

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
