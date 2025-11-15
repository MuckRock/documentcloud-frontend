<script context="module" lang="ts">
  import type { Document, DocumentText, ViewerMode } from "$lib/api/types";

  import { Story, Template } from "@storybook/addon-svelte-csf";
  import ViewerContext from "../ViewerContext.svelte";
  import Viewer from "../Viewer.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  import leflerThesis from "@/test/fixtures/documents/examples/lefler-thesis.json";
  import txt from "@/test/fixtures/documents/document.txt.json";
  import { searchWithin } from "@/test/handlers/documents";
  import { simulatePDF403Error } from "@/test/handlers/viewer";
  import { pdfUrl } from "$lib/api/documents";

  const document = doc as Document;
  const longDocument = leflerThesis as Document;

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
    <ViewerContext {...args}>
      <Viewer />
    </ViewerContext>
  </div>
</Template>

<Story
  name="Edit Access"
  args={{
    ...args,
    document: {
      ...document,
      edit_access: true,
      notes: document.notes?.map((note) => ({ ...note, edit_access: true })),
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
<Story
  name="Annotating"
  args={{
    ...args,
    mode: "annotating",
    document: {
      ...document,
      edit_access: true,
      notes: document.notes?.map((note) => ({ ...note, edit_access: true })),
    },
  }}
/>
<Story
  name="Search"
  parameters={{
    msw: { handlers: [searchWithin.data] },
    sveltekit_experimental: {
      stores: {
        page: {
          url: new URL(
            `https://www.dev.documentcloud.org/documents/20000040-the-santa-anas/?q=Trump`,
          ),
        },
      },
    },
  }}
  args={{
    ...args,
    mode: "search",
    document: {
      ...document,
      edit_access: true,
      notes: document.notes?.map((note) => ({ ...note, edit_access: true })),
    },
  }}
/>

<Story
  name="With 403 Error"
  parameters={{
    msw: { handlers: [simulatePDF403Error(pdfUrl(document).href)] },
  }}
  args={{
    ...args,
    mode: "document",
    document: {
      ...document,
      access: "private",
    },
  }}
/>

<Story
  name="Long Document"
  args={{
    ...args,
    document: longDocument,
  }}
/>

<style>
  .vh {
    height: 100vh;
  }
</style>
