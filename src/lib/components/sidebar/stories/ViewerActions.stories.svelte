<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import ViewerActions from "../ViewerActions.svelte";
  import type { Document } from "$lib/api/types";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  const document = doc as Document;

  export const meta = {
    title: "Components / Sidebar / Viewer Actions",
    component: ViewerActions,
    parameters: {
      layout: "centered",
    },
    tags: ["autodocs"],
  };

  let args = {
    document,
  };
</script>

<Template let:args>
  <ViewerActions {...args} />
</Template>

<Story
  name="Can Edit"
  args={{ document: { ...document, edit_access: true } }}
/>
<Story name="Can Read" {args} />
