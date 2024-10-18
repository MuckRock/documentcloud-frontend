<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Actions from "../Actions.svelte";
  import type { Document } from "@/lib/api/types";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  const document = doc as Document;

  export const meta = {
    title: "Components / Documents / Actions",
    component: Actions,
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
  <Actions {...args} />
</Template>

<Story
  name="Can Edit"
  args={{ document: { ...document, edit_access: true } }}
/>
<Story name="Can Read" {args} />
