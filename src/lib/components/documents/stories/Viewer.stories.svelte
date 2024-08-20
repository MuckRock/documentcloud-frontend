<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Viewer from "../Viewer.svelte";
  import type { Document, Note, ViewerMode } from "@/lib/api/types";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  import txt from "@/test/fixtures/documents/document.txt.json";
  const document = doc as Document;

  export const meta = {
    title: "Viewer",
    component: Viewer,
    parameters: {
      layout: "fullscreen",
    },
    tags: ["autodocs"],
  };
</script>

<Template let:args>
  <Viewer {...args} />
</Template>

<Story name="Document">
  <Viewer mode="document" text={txt} {document} />
</Story>

<Story name="Text">
  <Viewer mode="text" text={txt} {document} />
</Story>

<Story name="Thumbnails">
  <Viewer mode="grid" text={txt} {document} />
</Story>

<Story name="Notes">
  <Viewer mode="notes" text={txt} {document} />
</Story>
