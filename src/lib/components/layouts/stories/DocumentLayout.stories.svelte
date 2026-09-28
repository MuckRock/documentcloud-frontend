<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DocumentLayout from "../DocumentLayout.svelte";
  import ViewerContext from "../../viewer/ViewerContext.svelte";

  import type { Document, DocumentText, Maybe, Note } from "$lib/api/types";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  import txt from "@/test/fixtures/documents/document.txt.json";
  import { pdfUrl } from "$lib/api/documents";
  // Notes load separately from the document, so split them off the fixture.
  const { notes = [], ...document } = doc as Document;

  const { Story } = defineMeta({
    title: "Layout / Document",
    component: DocumentLayout,
    render: template,
    parameters: {
      layout: "fullscreen",
      sveltekit_experimental: {
        state: {
          page: {
            url: new URL("https://www.documentcloud.org/"),
          },
        },
      },
    },
  });

  type Args = {
    document: Document;
    notes: Note[];
    text: Promise<Maybe<DocumentText>>;
  };

  const args: Args = {
    document,
    notes,
    text: Promise.resolve(txt),
  };
</script>

{#snippet template(args: Args)}
  <div class="vh">
    <ViewerContext
      document={args.document}
      notes={args.notes}
      text={args.text}
      asset_url={pdfUrl(args.document)}
    >
      <DocumentLayout />
    </ViewerContext>
  </div>
{/snippet}

<Story name="With Read Access" {args} />

<Story
  name="With Edit Access"
  args={{
    ...args,
    document: {
      ...document,
      edit_access: true,
    },
  }}
/>

<Story
  name="Without Description"
  args={{
    ...args,
    document: {
      ...document,
      description: "",
      edit_access: true,
    },
  }}
/>

<Story name="With Processing Document" {args} />

<style>
  .vh {
    height: 100vh;
  }
</style>
