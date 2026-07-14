<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import type { Document } from "$lib/api/types";
  import ViewerContext from "../ViewerContext.svelte";
  import Zoom from "../Zoom.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";

  const document = doc as Document;

  const { Story } = defineMeta({
    title: "Viewer / Zoom",
    component: Zoom,
    parameters: {
      layout: "centered",
    },
    tags: ["autodocs"],
    render: template,
  });

  // Zoom reads its mode from ViewerContext, not from props.
  let args = {
    context: { document, mode: "document" },
  };
</script>

{#snippet template(args)}
  <ViewerContext {...args.context}>
    <Zoom />
  </ViewerContext>
{/snippet}

<Story name="Document Zoom" {args} />

<Story
  name="Text Zoom"
  args={{ ...args, context: { ...args.context, mode: "text" } }}
/>

<Story
  name="Grid Zoom"
  args={{ ...args, context: { ...args.context, mode: "grid" } }}
/>
