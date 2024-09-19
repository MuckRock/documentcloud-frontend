<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import EmbedLayout from "../EmbedLayout.svelte";

  import type { Document, Page, Note, Project } from "@/lib/api/types";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  import txt from "@/test/fixtures/documents/document.txt.json";
  import note from "@/test/fixtures/notes/note-expanded.json";
  import { project } from "@/test/fixtures/projects";
  import DocumentEmbed from "../../embeds/DocumentEmbed.svelte";
  import { canonicalUrl, pdfUrl } from "@/lib/api/documents";

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

<Template let:args />

<Story name="With Document" {args} let:args>
  <div class="vh">
    <EmbedLayout
      settings={args.settings}
      canonicalUrl={canonicalUrl(document).href}
      downloadUrl={pdfUrl(document).href}
    >
      <DocumentEmbed settings={args.settings} {document} text={txt} />
    </EmbedLayout>
  </div>
</Story>

<style>
  .vh {
    height: 100vh;
  }
</style>
