<script context="module" lang="ts">
  import type { Document } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import ThumbnailGrid from "../ThumbnailGrid.svelte";

  export const meta = {
    title: "Components / Documents / Thumbnail grid",
    component: ThumbnailGrid,
    parameters: { layout: "fullscreen" },
  };

  import doc from "$lib/api/fixtures/documents/examples/lefler-thesis.json";

  const document = doc as Document;
</script>

<Story name="thumbnail">
  <ThumbnailGrid {document} />
</Story>

<Story name="small">
  <ThumbnailGrid {document} size="small" />
</Story>

<Story name="normal">
  <ThumbnailGrid {document} size="normal" />
</Story>
