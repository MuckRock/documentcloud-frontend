<script context="module" lang="ts">
  import type { Document, DocumentText, ViewerMode } from "$lib/api/types";

  import { Story, Template } from "@storybook/addon-svelte-csf";
  import ViewerContextDecorator from "@/../.storybook/decorators/ViewerContextDecorator.svelte";
  import Viewer from "../Viewer.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  import txt from "@/test/fixtures/documents/document.txt.json";
  import Note from "../Note.svelte";

  const document = doc as Document;

  export const meta = {
    title: "Components / Viewer / Viewer",
    component: Viewer,
    parameters: {
      layout: "fullscreen",
    },
    tags: ["autodocs"],
  };

  let args: {
    document: Document;
    text: DocumentText;
    mode: ViewerMode;
    embed: boolean;
  } = {
    document,
    text: txt,
    mode: "document",
    embed: false,
  };
</script>

<Template let:args>
  <div class="vh">
    <ViewerContextDecorator mode={args.mode}>
      <Viewer {...args} />
    </ViewerContextDecorator>
  </div>
</Template>

<Story
  name="Edit Access"
  args={{
    ...args,
    document: {
      ...document,
      edit_access: true,
      notes: document.notes.map((note) => ({ ...note, edit_access: true })),
    },
  }}
/>
<Story
  name="Embedded"
  args={{
    ...args,
    document: { ...document },
    embed: true,
  }}
/>

<Story name="Document" {args} />
<Story name="Text" args={{ ...args, mode: "text" }} />
<Story name="Thumbnails" args={{ ...args, mode: "grid" }} />
<Story name="Notes" args={{ ...args, mode: "notes" }} />

<style>
  .vh {
    height: 100vh;
  }
</style>
