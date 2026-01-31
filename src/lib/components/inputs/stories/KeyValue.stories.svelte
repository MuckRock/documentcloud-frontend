<script module lang="ts">
  import type { ComponentProps } from "svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import KeyValue, { type Result } from "../KeyValue.svelte";

  const keys = ["_tag", "author"];

  type Args = ComponentProps<typeof KeyValue>;

  const { Story } = defineMeta({
    title: "Forms / Inputs /Key-Value",
    component: KeyValue,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
  });
</script>

<script>
  async function delay(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  async function onadd({ key, value }): Promise<Result> {
    await delay(1000);
    return { clear: true };
  }

  async function ondelete({ key, value }): Promise<Result> {
    await delay(1000);
    return { clear: true };
  }
</script>

{#snippet template(args: Args)}
  <table>
    <KeyValue {...args} />
  </table>
{/snippet}

<Story
  name="Add"
  args={{
    keys,
    add: true,
    key: "_tag",
    value: "Foobar",
    onadd,
    ondelete,
  }}
  {template}
/>

<Story
  name="Edit"
  args={{ keys, key: "author", value: "Joan Didion", onadd, ondelete }}
  {template}
/>

<Story
  name="Tag input"
  args={{ keys, key: "_tag", onadd, ondelete }}
  {template}
/>

<Story
  name="Tag with value"
  args={{ keys, key: "_tag", value: "California", onadd, ondelete }}
  {template}
/>

<Story
  name="Disabled"
  args={{
    keys,
    key: "_tag",
    value: "California",
    disabled: true,
    onadd,
    ondelete,
  }}
  {template}
/>

<Story name="Empty" args={{ keys: [], onadd, ondelete }} {template} />

<style>
  table {
    display: flex;
  }
</style>
