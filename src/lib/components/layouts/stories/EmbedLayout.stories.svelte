<script lang="ts" context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import EmbedLayout from "../EmbedLayout.svelte";

  import type { Document } from "$lib/api/types";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  import txt from "@/test/fixtures/documents/document.txt.json";
  import DocumentEmbed from "../../embeds/DocumentEmbed.svelte";
  import { canonicalUrl, pdfUrl } from "$lib/api/documents";
  import ViewerContext from "../../viewer/ViewerContext.svelte";

  const document = doc as Document;

  export const meta = {
    title: "Layout / Embed",
    component: EmbedLayout,
    parameters: {
      layout: "fullscreen",
    },
  };

  let args = {
    settings: {
      fullscreen: true,
      title: 1,
      pdf: 1,
      onlyshoworg: 0,
    },
  };
</script>

<Story name="With Document" {args} let:args>
  <div class="vh">
    <ViewerContext {document} text={txt} asset_url={pdfUrl(document)}>
      <EmbedLayout
        settings={args.settings}
        canonicalUrl={canonicalUrl(document).href}
        downloadUrl={pdfUrl(document).href}
      >
        <DocumentEmbed settings={args.settings} />
      </EmbedLayout>
    </ViewerContext>
  </div>
</Story>

<style>
  .vh {
    height: 100vh;
  }
</style>
