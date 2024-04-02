<script context="module" lang="ts">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import InputSelect from "../InputSelect.svelte";

  export const meta = {
    title: "Components / Forms / Inputs / Select",
    component: InputSelect,
    tags: ["autodocs"],
  };

  let args = {
    name: "selectInput",
    items: [
      { value: "first", label: "First Choice" },
      { value: "second", label: "Second Choice" },
      { value: "third", label: "Third Choice" },
      { value: "fourth", label: "Fourth Choice" },
      { value: "fifth", label: "Fifth Choice" },
      { value: "sixth", label: "Sixth Choice" },
    ],
  };
</script>

<Template let:args>
  <InputSelect {...args} />
</Template>

<Story name="Empty" {args} />
<Story name="Clearable" args={{ ...args, clearable: true }} />
<Story name="Multiple" args={{ ...args, multiple: true }} />
<Story
  name="With Placeholder"
  args={{ ...args, placeholder: "Go on, make my day…" }}
/>
<Story name="With Selection" args={{ ...args, value: "third" }} />
