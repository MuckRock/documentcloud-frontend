<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DocumentLayout from "../DocumentLayout.svelte";
  import ViewerContext from "../../viewer/ViewerContext.svelte";

  import type { Document, DocumentText, Maybe } from "$lib/api/types";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  import txt from "@/test/fixtures/documents/document.txt.json";
  import { pdfUrl } from "$lib/api/documents";
  const document = doc as Document;

  const { Story } = defineMeta({
    title: "Layout / Document",
    component: DocumentLayout,
    render: template,
    parameters: {
      layout: "fullscreen",
      sveltekit_experimental: {
        stores: {
          page: {
            url: "/",
          },
        },
      },
    },
  });

  type Args = {
    document: Document;
    text: Promise<Maybe<DocumentText>>;
  };

  const args: Args = {
    document,
    text: Promise.resolve(txt),
  };
</script>

{#snippet template(args: Args)}
  <div class="vh">
    <ViewerContext
      document={args.document}
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
