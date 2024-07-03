<script context="module" lang="ts">
  import type { Document } from "$lib/api/types";
  import { Story } from "@storybook/addon-svelte-csf";
  import PdfPage from "../PDFPage.svelte";

  import * as pdfjs from "pdfjs-dist/build/pdf.mjs";
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url,
  ).href;
  import { pageSizes } from "@/api/pageSize.js";

  import doc from "$lib/api/fixtures/documents/examples/the-santa-anas.json";
  import textPositions from "$lib/api/fixtures/documents/examples/the-santa-anas-p1.position.json";
  import pdfFile from "$lib/api/fixtures/documents/examples/the-santa-anas.pdf";

  const document = doc as Document;

  export const meta = {
    title: "Components / Documents / PDF Page",
    component: PdfPage,
    parameters: { layout: "centered" },
  };

  const sizes = pageSizes(document.page_spec);
  const [width, height] = sizes[0];
  const query = "los angeles";
  const url = new URL(pdfFile, import.meta.url);

  async function load(url: URL) {
    return pdfjs.getDocument(url).promise;
  }
</script>

<Story name="server text">
  {#await load(url) then pdf}
    <PdfPage
      {document}
      page_number={1}
      scale={1.5}
      {pdf}
      text={textPositions}
      {width}
      {height}
    />
  {/await}
</Story>

<Story name="embedded text">
  {#await load(url) then pdf}
    <PdfPage {document} page_number={1} scale={1.5} {pdf} {width} {height} />
  {/await}
</Story>

<Story name="search results">
  {#await load(url) then pdf}
    <PdfPage
      {document}
      page_number={1}
      scale={1.5}
      {pdf}
      {width}
      {height}
      {query}
    />
  {/await}
</Story>

<Story name="annotation options">
  {#await load(url) then pdf}
    <PdfPage
      {document}
      page_number={1}
      scale={1.5}
      {pdf}
      {width}
      {height}
      edit_access
    />
  {/await}
</Story>
