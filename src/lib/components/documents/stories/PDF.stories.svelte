<script context="module" lang="ts">
  import type { Document } from "@/lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import PDF from "../PDF.svelte";
  import { IMAGE_WIDTHS_MAP } from "@/config/config.js";
  import { pdfUrl } from "$lib/api/documents";

  import doc from "$lib/api/fixtures/documents/document-expanded.json";

  export const meta = {
    title: "Components / Documents / PDF Viewer",
    component: PDF,
    parameters: { layout: "centered" },
  };

  const document = doc as Document;
</script>

<Story name="default">
  <div style="width: {IMAGE_WIDTHS_MAP.get('large')}px;">
    <PDF {document} asset_url={pdfUrl(document)} />
  </div>
</Story>
