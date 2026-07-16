<script module lang="ts">
  import type { Document } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  import DocumentEmbed from "../DocumentEmbed.svelte";
  import EmbedLayout from "../../layouts/EmbedLayout.svelte";
  import ViewerContext from "../../viewer/ViewerContext.svelte";
  import { canonicalUrl } from "$lib/api/documents";
  import { documentExpanded as document } from "@/test/fixtures/documents";

  const { Story } = defineMeta({
    title: "Embed / Document",
    component: DocumentEmbed,
    parameters: { layout: "fullscreen", chromatic: { viewports: [320, 1200] } },
    render: template,
  });

  type Args = { document: Document };
</script>

{#snippet template(args: Args)}
  <div class="vh-100">
    <EmbedLayout canonicalUrl={canonicalUrl(args.document).href}>
      <ViewerContext document={args.document} embed>
        <DocumentEmbed />
      </ViewerContext>
    </EmbedLayout>
  </div>
{/snippet}

<Story name="Public" args={{ document }} />

<Story name="Private" args={{ document: { ...document, access: "private" } }} />

<style>
  .vh-100 {
    max-height: 100vh;
    max-width: 1200px;
  }
</style>
