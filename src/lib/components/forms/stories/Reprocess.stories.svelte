<script context="module" lang="ts">
  import type { Document } from "$lib/api/types";
  import { Story } from "@storybook/addon-svelte-csf";
  import Reprocess from "../Reprocess.svelte";

  import doc from "$lib/api/fixtures/documents/document-expanded.json";
  import docs from "$lib/api/fixtures/documents/documents-expanded.json";

  const document = doc as Document;
  const documents = docs.results as Document[];

  export const meta = {
    title: "Forms / Reprocess",
    component: Reprocess,
    parameters: { layout: "centered" },
  };
</script>

<Story name="one document">
  <Reprocess documents={[document]} />
</Story>

<Story name="selected documents">
  <Reprocess {documents} />
</Story>
