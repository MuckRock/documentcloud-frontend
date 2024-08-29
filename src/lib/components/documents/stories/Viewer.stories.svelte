<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Viewer from "../Viewer.svelte";
  import type { Document, Note, ViewerMode } from "@/lib/api/types";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  import txt from "@/test/fixtures/documents/document.txt.json";
  const document = doc as Document;

  export const meta = {
    title: "Components / Documents / Viewer",
    component: Viewer,
    parameters: {
      layout: "fullscreen",
    },
    tags: ["autodocs"],
  };

  let args = {
    document,
    mode: "document",
    text: txt,
  };
</script>

<Template let:args>
  <div class="vh">
    <Viewer {...args} />
  </div>
</Template>

<Story
  name="Edit Access"
  args={{
    ...args,
    document: { ...document, edit_access: true },
  }}
/>

<Story name="Document">
  <Viewer text={txt} {document} />
</Story>

<Story name="Text">
  <Viewer text={txt} {document} />
</Story>

<Story name="Thumbnails">
  <Viewer text={txt} {document} />
</Story>

<Story name="Notes">
  <Viewer text={txt} {document} />
</Story>

<style>
  .vh {
    height: 100vh;
  }
</style>
