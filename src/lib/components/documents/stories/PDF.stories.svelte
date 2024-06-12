<script context="module" lang="ts">
  import type { Document, Note, ViewerMode } from "@/lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import PDF from "../PDF.svelte";
  import { IMAGE_WIDTHS_MAP } from "@/config/config.js";
  import { pdfUrl } from "$lib/api/documents";

  import doc from "$lib/api/fixtures/documents/document-expanded.json";
  import * as mock from "$lib/api/fixtures/mock";

  export const meta = {
    title: "Components / Documents / PDF Viewer",
    component: PDF,
    parameters: { layout: "centered" },
  };

  const document = doc as Document;
</script>

<script lang="ts">
  import { setContext } from "svelte";
  import { writable, type Writable } from "svelte/store";

  const activeNote: Writable<Note> = writable(null);
  const mode: Writable<ViewerMode> = writable("document");

  setContext("activeNote", activeNote);
  setContext("mode", mode);
</script>

<Story name="default">
  <div style="width: {IMAGE_WIDTHS_MAP.get('large')}px;">
    <PDF document={{ ...document, notes: [] }} asset_url={pdfUrl(document)} />
  </div>
</Story>

<Story name="show notes">
  <div style="width: {IMAGE_WIDTHS_MAP.get('large')}px;">
    <PDF {document} asset_url={pdfUrl(document)} />
  </div>
</Story>

<Story name="fit width" parameters={{ layout: "fullscreen" }}>
  <PDF {document} asset_url={pdfUrl(document)} scale="width" />
</Story>

<Story name="no pdf" parameters={{ msw: { handlers: [mock.loading] } }}>
  <div style="width: {IMAGE_WIDTHS_MAP.get('large')}px;">
    <PDF {document} asset_url={new URL(mock.urls.loading)} />
  </div>
</Story>

<Story name="missing page spec">
  <div style="width: {IMAGE_WIDTHS_MAP.get('large')}px;">
    <PDF
      document={{ ...document, notes: [], page_spec: undefined }}
      asset_url={pdfUrl(document)}
    />
  </div>
</Story>
