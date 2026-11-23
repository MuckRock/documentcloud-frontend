<script module lang="ts">
  import type { Document } from "$lib/api/types";

  import { page } from "$app/state";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PdfPage from "../PDFPage.svelte";

  import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.mjs",
    import.meta.url,
  ).href;
  import { pagesFromSpec } from "$lib/utils/pageSize";
  import { Page } from "$lib/utils/page.svelte";

  import doc from "@/test/fixtures/documents/examples/the-santa-anas.json";
  import textPositions from "@/test/fixtures/documents/examples/the-santa-anas-p1.position.json";
  import pdfFile from "@/test/fixtures/documents/examples/the-santa-anas.pdf";
  import ViewerContext from "../ViewerContext.svelte";

  // Notes load separately from the document, so split them off the fixture.
  const { notes = [], ...fixture } = doc as Document;
  const document = { ...fixture, edit_access: true };

  const { Story } = defineMeta({
    title: "Viewer / PDF Page",
    component: PdfPage,
    parameters: { layout: "centered" },
  });

  const pages = pagesFromSpec(document.page_spec!);
  const pageData = pages[0]!;
  const query = "los angeles";
  const url = new URL(pdfFile, import.meta.url);
</script>

<!-- The viewer resolves "auto" zoom to a number before passing `scale` down. -->
<Story name="full size" parameters={{ layout: "fullscreen" }} asChild>
  <ViewerContext {document} {notes} asset_url={url}>
    <PdfPage page_number={1} page={pageData} scale={1} />
  </ViewerContext>
</Story>

<Story name="embedded text" asChild>
  <ViewerContext {document} {notes} asset_url={url}>
    <PdfPage page_number={1} page={pageData} scale={1.5} />
  </ViewerContext>
</Story>

<Story name="server text" asChild>
  <ViewerContext {document} {notes} asset_url={url}>
    <PdfPage page_number={1} page={pageData} scale={1.5} text={textPositions} />
  </ViewerContext>
</Story>

<Story
  name="search results"
  parameters={{
    // PDFPage derives its search query from `$app/state` (page.url); this
    // override injects the query URL via @storybook/sveltekit's state mock.
    sveltekit_experimental: {
      state: {
        page: {
          url: new URL(
            `https://www.dev.documentcloud.org/documents/20000040-the-santa-anas/?q=${query}`,
          ),
        },
      },
    },
  }}
  asChild
>
  <ViewerContext {document} {notes} asset_url={url}>
    <p>Query: {query}</p>
    <p>URL: {page.url}</p>
    <PdfPage page_number={1} page={pageData} scale={1.5} />
  </ViewerContext>
</Story>

<!-- With no page_spec, the page starts at 0x0 and takes its size from pdf.js. -->
<Story name="size from pdf.js" asChild>
  <ViewerContext {document} {notes} asset_url={url}>
    <PdfPage
      page_number={1}
      page={new Page({ index: 0, width: 0, height: 0 })}
      scale={1}
    />
  </ViewerContext>
</Story>

<Story name="long section start" parameters={{ layout: "fullscreen" }} asChild>
  <ViewerContext {document} {notes} asset_url={url}>
    <PdfPage page_number={1} page={pageData} scale={1} />
  </ViewerContext>
</Story>
