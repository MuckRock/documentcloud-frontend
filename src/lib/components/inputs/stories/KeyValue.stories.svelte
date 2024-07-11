<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import KeyValue from "../KeyValue.svelte";

  export const meta = {
    title: "Components / Inputs / Key-Value",
    component: KeyValue,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
  };

  const keys = ["_tag", "author"];
</script>

<Template let:args>
  <table>
    <KeyValue {keys} key={args.key} value={args.value} />
  </table>
</Template>

<Story name="key and value" args={{ key: "author", value: "Joan Didion" }} />

<Story name="tag input" args={{ key: "_tag" }} />

<Story name="tag with value" args={{ key: "_tag", value: "California" }} />

<Story name="empty" />
