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
    <KeyValue {keys} {...args} />
  </table>
</Template>

<Story name="Add" args={{ add: true, key: "_tag", value: "Foobar" }} />

<Story name="Edit" args={{ key: "author", value: "Joan Didion" }} />

<Story name="Tag input" args={{ key: "_tag" }} />

<Story name="Tag with value" args={{ key: "_tag", value: "California" }} />

<Story name="Empty" />
