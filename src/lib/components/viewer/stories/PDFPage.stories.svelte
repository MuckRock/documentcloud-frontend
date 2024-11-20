<script context="module" lang="ts">
  import type { Document, Section } from "$lib/api/types";
  import { writable } from "svelte/store";
  import { Story } from "@storybook/addon-svelte-csf";
  import PdfPage from "../PDFPage.svelte";

  import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url,
  ).href;
  import { pageSizes } from "$lib/utils/pageSize";

  import doc from "@/test/fixtures/documents/examples/the-santa-anas.json";
  import textPositions from "@/test/fixtures/documents/examples/the-santa-anas-p1.position.json";
  import pdfFile from "@/test/fixtures/documents/examples/the-santa-anas.pdf";
  import ViewerContext from "../ViewerContext.svelte";

  const document = { ...doc, edit_access: true } as Document;

  export const meta = {
    title: "Components / Viewer / PDF Page",
    component: PdfPage,
    parameters: { layout: "centered" },
  };

  const sizes = pageSizes(document.page_spec!);
  const [width, height] = sizes[0]!;
  const query = "los angeles";
  const url = new URL(pdfFile, import.meta.url);

  async function load(url: URL): Promise<pdfjs.PDFDocumentProxy> {
    return pdfjs.getDocument(url).promise;
  }
</script>

<Story name="fit width" parameters={{ layout: "fullscreen" }}>
  <ViewerContext {document} pdf={writable(load(url))}>
    <PdfPage page_number={1} scale="width" {width} {height} />
  </ViewerContext>
</Story>

<Story name="embedded text">
  <ViewerContext {document} pdf={writable(load(url))}>
    <PdfPage page_number={1} scale={1.5} {width} {height} />
  </ViewerContext>
</Story>

<Story name="server text">
  <ViewerContext {document} pdf={writable(load(url))}>
    <PdfPage
      page_number={1}
      scale={1.5}
      text={textPositions}
      {width}
      {height}
    />
  </ViewerContext>
</Story>

<Story name="search results">
  <ViewerContext {document} pdf={writable(load(url))} {query}>
    <p>Query: {query}</p>
    <PdfPage page_number={1} scale={1.5} {width} {height} />
  </ViewerContext>
</Story>

<Story name="long section start" parameters={{ layout: "fullscreen" }}>
  <ViewerContext {document} pdf={writable(load(url))}>
    <PdfPage page_number={1} scale="width" {width} {height} />
  </ViewerContext>
</Story>
