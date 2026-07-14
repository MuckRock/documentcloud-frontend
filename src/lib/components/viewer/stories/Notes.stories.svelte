<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import type { Document } from "$lib/api/types";
  import doc from "@/test/fixtures/documents/document-expanded.json";
  import pdfFile from "@/test/fixtures/documents/examples/agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government.pdf";
  import ViewerContext from "../ViewerContext.svelte";
  import Notes from "../Notes.svelte";

  const { Story } = defineMeta({
    title: "Viewer / Notes View",
    component: Notes,
    parameters: { layout: "centered" },
    render: template,
  });

  const document = doc as Document;
  const url = new URL(pdfFile, import.meta.url);

  let args = {
    document,
    asset_url: url,
  };
</script>

{#snippet template(args)}
  <ViewerContext {...args}>
    <Notes />
  </ViewerContext>
{/snippet}

<Story name="notes using images" args={{ document }} />

<Story name="notes using a PDF file" {args} />

<Story name="no notes" args={{ document: { ...document, notes: [] } }} />
