<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Checkbox from "../Checkbox.svelte";

  const { Story } = defineMeta({
    title: "Forms / Inputs /Checkbox",
    component: Checkbox,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  });
</script>

<Story name="off" />

<Story name="on" args={{ value: true }} />

<Story name="some" args={{ indeterminate: true }} />

<Story name="labeled" args={{ label: "Select all" }} />
