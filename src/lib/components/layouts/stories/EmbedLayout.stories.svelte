<script module lang="ts">
  import type { ComponentProps } from "svelte";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import EmbedLayout from "../EmbedLayout.svelte";

  import type { Document } from "$lib/api/types";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  import txt from "@/test/fixtures/documents/document.txt.json";
  import DocumentEmbed from "../../embeds/DocumentEmbed.svelte";
  import { canonicalUrl, pdfUrl } from "$lib/api/documents";
  import ViewerContext from "../../viewer/ViewerContext.svelte";

  const document = doc as Document;
  const text = Promise.resolve(txt);

  const { Story } = defineMeta({
    title: "Layout / Embed",
    component: EmbedLayout,
    parameters: {
      layout: "fullscreen",
    },
  });

  type Args = ComponentProps<typeof EmbedLayout>;

  const args = {
    settings: {
      fullscreen: 1,
      title: 1,
      pdf: 1,
      onlyshoworg: 0,
    },
  };
</script>

<Story name="With Document" {args}>
  {#snippet template(args: Args)}
    <div class="vh">
      <ViewerContext {document} {text} asset_url={pdfUrl(document)} embed>
        <EmbedLayout
          settings={args.settings}
          canonicalUrl={canonicalUrl(document).href}
          downloadUrl={pdfUrl(document).href}
        >
          <DocumentEmbed settings={args.settings} />
        </EmbedLayout>
      </ViewerContext>
    </div>
  {/snippet}
</Story>

<style>
  .vh {
    height: 100vh;
  }
</style>
