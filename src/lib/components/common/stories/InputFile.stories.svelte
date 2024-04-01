<script context="module" lang="ts">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";
  import InputFile from "../InputFile.svelte";

  export const meta = {
    title: "Components / Common / Inputs / File",
    component: InputFile,
    tags: ["autodocs"],
  };

  let args = {
    name: "fileInput",
    multiple: false,
    onFileSelect: action("File Select"),
  };
</script>

<Template let:args>
  <InputFile {...args}>Select Files</InputFile>
</Template>

<Story name="Default" {args} />
<Story name="Multiple" args={{ ...args, multiple: true }} />
<Story name="With Primary Button" args={{ ...args, buttonMode: "primary" }} />
