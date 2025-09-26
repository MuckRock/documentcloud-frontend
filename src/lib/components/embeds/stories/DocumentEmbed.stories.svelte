<script context="module" lang="ts">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import DocumentEmbed from "../DocumentEmbed.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";
  import EmbedLayout from "../../layouts/EmbedLayout.svelte";
  import { canonicalUrl } from "$lib/api/documents";
  import type { Document } from "$lib/api/types";

  const document = doc as Document;

  let args = {
    document,
    currentTab: "document",
  };

  export const meta = {
    title: "Embed / Document",
    component: DocumentEmbed,
    parameters: { layout: "fullscreen" },
  };
</script>

<Template let:args>
  <div class="vh-100">
    <EmbedLayout canonicalUrl={canonicalUrl(document).href}>
      <DocumentEmbed {...args} />
    </EmbedLayout>
  </div>
</Template>

<Story name="Public" {args} />
<Story
  name="Private"
  args={{ ...args, document: { ...document, access: "private" } }}
/>

<style>
  .vh-100 {
    height: 100vh;
  }
</style>
