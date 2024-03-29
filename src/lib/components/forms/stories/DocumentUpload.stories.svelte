<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import DocumentUpload from "../DocumentUpload.svelte";

  export const meta = {
    title: "Components / Forms / Document Upload",
    component: DocumentUpload,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <DocumentUpload {...args} />
</Template>

<Story name="Empty" />
<Story name="With Documents" />
