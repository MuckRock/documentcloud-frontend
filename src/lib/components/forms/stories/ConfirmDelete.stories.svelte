<script context="module" lang="ts">
  import type { Document } from "@/lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import ConfirmDelete from "../ConfirmDelete.svelte";

  import doc from "@/test/fixtures/documents/document.json";
  import docs from "@/test/fixtures/documents/documents.json";

  const document = doc as Document;
  const documents = docs.results as Document[];

  export const meta = {
    title: "Forms / Confirm delete",
    component: ConfirmDelete,
    parameters: { layout: "centered" },
  };
</script>

<Story name="one document">
  <div style="max-width: 66ch;">
    <ConfirmDelete documents={[document]} />
  </div>
</Story>

<Story name="bulk delete">
  <div style="max-width: 66ch;">
    <ConfirmDelete {documents} />
  </div>
</Story>
