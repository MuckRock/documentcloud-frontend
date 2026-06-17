<script module lang="ts">
  import type { ComponentProps } from "svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";
  import File from "../File.svelte";

  const { Story } = defineMeta({
    title: "Forms / Inputs /File",
    component: File,
    tags: ["autodocs"],
    render: template,
  });

  type Args = ComponentProps<typeof File>;

  const args = {
    name: "fileInput",
    multiple: false,
    onFileSelect: action("File Select"),
  };
</script>

{#snippet template(args: Args)}
  <File {...args}>Select Files</File>
{/snippet}

<Story name="Default" {args} />
<Story name="Multiple" args={{ ...args, multiple: true }} />
<Story name="With Primary Button" args={{ ...args, buttonMode: "primary" }} />
