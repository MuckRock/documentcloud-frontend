<script context="module" lang="ts">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";
  import File from "../File.svelte";

  export const meta = {
    title: "Components / Inputs / File",
    component: File,
    tags: ["autodocs"],
  };

  let args = {
    name: "fileInput",
    multiple: false,
    onFileSelect: action("File Select"),
  };
</script>

<Template let:args>
  <File {...args}>Select Files</File>
</Template>

<Story name="Default" {args} />
<Story name="Multiple" args={{ ...args, multiple: true }} />
<Story name="With Primary Button" args={{ ...args, buttonMode: "primary" }} />
