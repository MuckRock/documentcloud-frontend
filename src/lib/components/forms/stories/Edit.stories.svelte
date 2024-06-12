<script context="module" lang="ts">
  import type { Document } from "@/lib/api/types";
  import { Story } from "@storybook/addon-svelte-csf";
  import Edit from "../Edit.svelte";

  import doc from "$lib/api/fixtures/documents/document-expanded.json";

  const document = doc as Document;

  export const meta = {
    title: "Forms / Edit",
    component: Edit,
    parameters: { layout: "centered" },
  };
</script>

<Story name="default">
  <div style="min-width: 600px;">
    <Edit {document} />
  </div>
</Story>
