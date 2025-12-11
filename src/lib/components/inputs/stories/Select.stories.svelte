<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Select from "../Select.svelte";

  export const meta = {
    title: "Forms / Inputs / Select",
    component: Select,
    tags: ["autodocs"],
  };

  const name = "select";
  const options = [
    { value: "first", label: "First Choice" },
    { value: "second", label: "Second Choice" },
    { value: "third", label: "Third Choice" },
    { value: "fourth", label: "Fourth Choice" },
    { value: "fifth", label: "Fifth Choice" },
    { value: "sixth", label: "Sixth Choice" },
  ];
</script>

<Story name="Empty">
  <Select
    {name}
    {options}
    valueAsObject
    valueField="value"
    labelField="label"
  />
</Story>

<Story name="Clearable">
  <Select
    {name}
    {options}
    clearable={true}
    valueAsObject
    valueField="value"
    labelField="label"
  />
</Story>

<Story name="Multiple">
  <Select
    {name}
    {options}
    multiple={true}
    valueAsObject
    valueField="value"
    labelField="label"
  />
</Story>

<Story name="With Placeholder">
  <Select
    {name}
    {options}
    placeholder="Go on, make my day…"
    valueAsObject
    valueField="value"
    labelField="label"
  />
</Story>

<Story name="With Selection">
  <Select
    {name}
    {options}
    value={{ value: "third", label: "Third Choice" }}
    valueAsObject
    valueField="value"
    labelField="label"
  />
</Story>

<Story name="With Selection, not object">
  <Select
    {name}
    {options}
    value="fourth"
    valueField="value"
    labelField="label"
  />
</Story>

<Story name="Disabled">
  <Select {name} {options} disabled />
</Story>
