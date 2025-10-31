<script context="module" lang="ts">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import DocumentEmbed from "../DocumentEmbed.svelte";

  import EmbedLayout from "../../layouts/EmbedLayout.svelte";
  import ViewerContext from "../../viewer/ViewerContext.svelte";
  import { canonicalUrl } from "$lib/api/documents";
  import { documentExpanded as document } from "@/test/fixtures/documents";

  let args = {
    document,
    currentTab: "document",
  };

  export const meta = {
    title: "Embed / Document",
    component: DocumentEmbed,
    parameters: { layout: "fullscreen", chromatic: { viewports: [320, 1200] } },
  };
</script>

<Template let:args>
  <div class="vh-100">
    <EmbedLayout canonicalUrl={canonicalUrl(args.document).href}>
      <ViewerContext document={args.document}>
        <DocumentEmbed />
      </ViewerContext>
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
    max-height: 100vh;
    max-width: 1200px;
  }
</style>
