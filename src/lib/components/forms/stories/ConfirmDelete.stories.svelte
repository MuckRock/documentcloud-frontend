<script module lang="ts">
  import type { Document } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ConfirmDelete from "../ConfirmDelete.svelte";

  import doc from "@/test/fixtures/documents/document.json";
  import docs from "@/test/fixtures/documents/documents.json";

  const document = doc as Document;
  const documents = docs.results as Document[];

  const { Story } = defineMeta({
    title: "Forms / Confirm delete",
    component: ConfirmDelete,
    parameters: { layout: "centered" },
    render: template,
  });
</script>

{#snippet template(args)}
  <div style="max-width: 66ch;">
    <ConfirmDelete {...args} />
  </div>
{/snippet}

<Story name="one document" args={{ documents: [document] }} />

<Story name="bulk delete" args={{ documents }} />

<Story name="disabled" args={{ documents: [] }} />

<Story
  name="bulk delete, too many"
  args={{ documents: Array(100).fill(document) }}
/>
