<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Select from "../Select.svelte";

  const { Story } = defineMeta({
    title: "Forms / Inputs / Select",
    component: Select,
    tags: ["autodocs"],
  });

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

<Story name="Empty" asChild>
  <Select
    {name}
    {options}
    valueAsObject
    valueField="value"
    labelField="label"
  />
</Story>

<Story name="Clearable" asChild>
  <Select
    {name}
    {options}
    clearable={true}
    valueAsObject
    valueField="value"
    labelField="label"
  />
</Story>

<Story name="Multiple" asChild>
  <Select
    {name}
    {options}
    multiple={true}
    valueAsObject
    valueField="value"
    labelField="label"
  />
</Story>

<Story name="With Placeholder" asChild>
  <Select
    {name}
    {options}
    placeholder="Go on, make my day…"
    valueAsObject
    valueField="value"
    labelField="label"
  />
</Story>

<Story name="With Selection" asChild>
  <Select
    {name}
    {options}
    value={{ value: "third", label: "Third Choice" }}
    valueAsObject
    valueField="value"
    labelField="label"
  />
</Story>

<Story name="With Selection, not object" asChild>
  <Select
    {name}
    {options}
    value="fourth"
    valueField="value"
    labelField="label"
  />
</Story>

<Story name="Disabled" asChild>
  <Select {name} {options} disabled />
</Story>
