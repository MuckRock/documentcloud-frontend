<script module lang="ts">
  import type { Document, Section } from "$lib/api/types";

  import { http, HttpResponse, delay } from "msw";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import PDF from "../PDF.svelte";
  import { pending } from "../RedactionLayer.svelte";

  import ViewerContext from "../ViewerContext.svelte";

  import { IMAGE_WIDTHS_MAP } from "@/config/config.js";
  import { pdfUrl } from "$lib/api/documents";

  import { createApiUrl } from "@/test/handlers/utils";
  import doc from "@/test/fixtures/documents/document-expanded.json";
  import redacted from "@/test/fixtures/documents/redactions.json";

  const document = doc as Document;

  const { Story } = defineMeta({
    title: "Viewer / PDF Viewer",
    component: PDF,
    parameters: { layout: "centered" },
    render: template,
  });

  const loadingUrl = createApiUrl("loading/");

  const sections: Section[] = [
    { id: 1, page_number: 1, title: "Something uneasy" },
    {
      id: 1,
      page_number: 1,
      title:
        "What it means is that tonight a Santa Ana will begin to blow, a hot wind from the northeast whining down through the Cajon and SanGorgonio Passes, blowing up sand storms out along Route 66, drying the hills andthe nerves to flash point.",
    },
  ];

  let args = {
    context: {
      document: {
        ...document,
        notes: [],
      },
      mode: "document",
      asset_url: pdfUrl(document),
    },
    props: {
      scale: "width",
    },
  };
</script>

{#snippet template(args)}
  <ViewerContext {...args.context}>
    <div style="width: {IMAGE_WIDTHS_MAP.get('large')}px;">
      <PDF {...args.props} />
    </div>
  </ViewerContext>
{/snippet}

<Story name="Default" {args} />

<Story
  name="With Notes"
  args={{ ...args, context: { ...args.context, document } }}
/>

<Story
  name="Fit width"
  parameters={{ layout: "fullscreen" }}
  args={{ ...args, props: { scale: "width" } }}
/>

<Story
  name="Zoom 200%"
  parameters={{ layout: "fullscreen" }}
  args={{ ...args, props: { scale: 2 } }}
/>

<Story
  name="File Loading"
  parameters={{
    msw: {
      handlers: [
        http.get(loadingUrl, async () => {
          await delay("infinite");
          return new HttpResponse(null, { status: 200 });
        }),
      ],
    },
  }}
  args={{
    ...args,
    context: { ...args.context, asset_url: new URL(loadingUrl) },
  }}
/>

<Story
  name="File Error"
  parameters={{
    msw: {
      handlers: [
        http.get(loadingUrl, () => {
          return HttpResponse.json("Something went horribly wrong.", {
            status: 400,
            statusText: "Ambiguous Error",
          });
        }),
      ],
    },
  }}
  args={{
    ...args,
    context: { ...args.context, asset_url: new URL(loadingUrl) },
  }}
/>

<Story
  name="Missing page_spec"
  args={{
    ...args,
    context: {
      ...args.context,
      document: { ...document, notes: [], page_spec: undefined },
    },
  }}
/>

<Story name="Redactions in-progress" asChild>
  <ViewerContext
    document={{ ...document, notes: [] }}
    asset_url={pdfUrl(document)}
  >
    <div style="width: {IMAGE_WIDTHS_MAP.get('large')}px;">
      <button on:click={() => ($pending[document.id] = redacted)}>
        Show redactions
      </button>
      <PDF />
    </div>
  </ViewerContext>
</Story>

<Story
  name="With Section"
  args={{
    ...args,
    context: {
      ...args.context,
      document: { ...document, notes: [], sections },
    },
  }}
/>

<Story
  name="With Errors"
  args={{
    ...args,
    context: {
      ...args.context,
      errors: [
        new TypeError("Something went wrong :("),
        new TypeError("And another thing, too!"),
      ],
    },
  }}
/>
