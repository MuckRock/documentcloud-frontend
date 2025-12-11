<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import KeyValue from "../KeyValue.svelte";

  export const meta = {
    title: "Forms / Inputs /Key-Value",
    component: KeyValue,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
  };

  const keys = ["_tag", "author"];
</script>

<Story name="Add">
  <table>
    <KeyValue {keys} add key="_tag" value="Foobar" />
  </table>
</Story>

<Story name="Edit">
  <table>
    <KeyValue {keys} key="author" value="Joan Didion" />
  </table>
</Story>

<Story name="Tag input">
  <table>
    <KeyValue {keys} key="_tag" />
  </table>
</Story>

<Story name="Tag with value">
  <table>
    <KeyValue {keys} key="_tag" value="California" />
  </table>
</Story>

<Story name="Disabled">
  <table>
    <KeyValue {keys} key="_tag" value="California" disabled />
  </table>
</Story>

<Story name="Empty">
  <table>
    <KeyValue {keys} />
  </table>
</Story>

<style>
  table {
    display: flex;
  }
</style>
