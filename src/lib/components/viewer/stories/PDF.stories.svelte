<script context="module" lang="ts">
  import { rest } from "msw";
  import type { Document, Note, Section, ViewerMode } from "@/lib/api/types";

  import { Story, Template } from "@storybook/addon-svelte-csf";

  import PDF from "../PDF.svelte";
  import { redactions } from "../RedactionLayer.svelte";

  import ViewerContext from "../ViewerContext.svelte";

  import { IMAGE_WIDTHS_MAP } from "@/config/config.js";
  import { pdfUrl } from "$lib/api/documents";

  import { createApiUrl } from "@/test/handlers/utils";
  import doc from "@/test/fixtures/documents/document-expanded.json";
  import redacted from "@/test/fixtures/documents/redactions.json";

  export const meta = {
    title: "Components / Viewer / PDF Viewer",
    component: PDF,
    parameters: { layout: "centered" },
  };

  const document = doc as Document;

  const loadingUrl = createApiUrl("loading/");

  const section: Section = { id: 1, page_number: 1, title: "Something uneasy" };
  const long_section: Section = {
    id: 1,
    page_number: 1,
    title:
      "What it means is that tonight a Santa Ana will begin to blow, a hot wind from the northeast whining down through the Cajon and SanGorgonio Passes, blowing up sand storms out along Route 66, drying the hills andthe nerves to flash point.",
  };

  let args = {
    context: {
      document,
      mode: "document",
      asset_url: pdfUrl(document),
    },
    props: {
      document: {
        ...document,
        notes: [],
      },
    },
  };
</script>

<Template let:args>
  <ViewerContext {...args.context}>
    <div style="width: {IMAGE_WIDTHS_MAP.get('large')}px;">
      <PDF {...args.props} />
    </div>
  </ViewerContext>
</Template>

<Story name="Default" {args} />

<Story
  name="With Notes"
  args={{ ...args, props: { ...args.props, document } }}
/>

<Story name="Fit width" parameters={{ layout: "fullscreen" }}>
  <ViewerContext {document} mode="document" asset_url={pdfUrl(document)}>
    <PDF {document} scale="width" />
  </ViewerContext>
</Story>

<Story name="Zoom 200%" parameters={{ layout: "fullscreen" }}>
  <ViewerContext {document} mode="document" asset_url={pdfUrl(document)}>
    <PDF {document} scale={2} />
  </ViewerContext>
</Story>

<Story
  name="Missing PDF"
  parameters={{
    msw: {
      handlers: [
        rest.get(loadingUrl, (req, res, ctx) => res(ctx.delay("infinite"))),
      ],
    },
  }}
  args={{ ...args, props: { document, asset_url: new URL(loadingUrl) } }}
/>

<Story
  name="Missing page_spec"
  args={{
    ...args,
    props: {
      ...args.props,
      document: { ...document, notes: [], page_spec: undefined },
    },
  }}
/>

<Story name="Redactions in-progress">
  <ViewerContext {document} asset_url={pdfUrl(document)}>
    <div style="width: {IMAGE_WIDTHS_MAP.get('large')}px;">
      <button on:click={() => ($redactions = redacted)}>Show redactions</button>
      <PDF document={{ ...document, notes: [] }} />
    </div>
  </ViewerContext>
</Story>

<Story name="With Section">
  <ViewerContext {document} asset_url={pdfUrl(document)}>
    <div style="width: {IMAGE_WIDTHS_MAP.get('large')}px;">
      <button on:click={() => ($redactions = redacted)}>Show redactions</button>
      <PDF document={{ ...document, notes: [], sections: [section] }} />
    </div>
  </ViewerContext>
</Story>

<Story name="With Long Section">
  <ViewerContext {document} asset_url={pdfUrl(document)}>
    <div style="width: {IMAGE_WIDTHS_MAP.get('large')}px;">
      <button on:click={() => ($redactions = redacted)}>Show redactions</button>
      <PDF document={{ ...document, notes: [], sections: [long_section] }} />
    </div>
  </ViewerContext>
</Story>
