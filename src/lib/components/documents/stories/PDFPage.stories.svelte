<script context="module" lang="ts">
  import type { Document, Section } from "$lib/api/types";
  import { Story } from "@storybook/addon-svelte-csf";
  import PdfPage from "../PDFPage.svelte";

  import * as pdfjs from "pdfjs-dist/build/pdf.mjs";
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url,
  ).href;
  import { pageSizes } from "@/api/pageSize.js";

  import doc from "@/test/fixtures/documents/examples/the-santa-anas.json";
  import textPositions from "@/test/fixtures/documents/examples/the-santa-anas-p1.position.json";
  import pdfFile from "@/test/fixtures/documents/examples/the-santa-anas.pdf";

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

  // sections
  const section: Section = { id: 1, page_number: 1, title: "Something uneasy" };
  const long_section: Section = {
    id: 1,
    page_number: 1,
    title:
      "What it means is that tonight a Santa Ana will begin to blow, a hot wind from the northeast whining down through the Cajon and SanGorgonio Passes, blowing up sand storms out along Route 66, drying the hills andthe nerves to flash point.",
  };

  async function load(url: URL) {
    return pdfjs.getDocument(url).promise;
  }
</script>

<Story name="embedded text">
  {#await load(url) then pdf}
    <PdfPage {document} page_number={1} scale={1.5} {pdf} {width} {height} />
  {/await}
</Story>

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

<Story name="section start">
  {#await load(url) then pdf}
    <PdfPage
      {document}
      page_number={1}
      scale={1.5}
      {pdf}
      {width}
      {height}
      {section}
    />
  {/await}
</Story>

<Story name="long section start">
  {#await load(url) then pdf}
    <PdfPage
      {document}
      page_number={1}
      scale={1.5}
      {pdf}
      {width}
      {height}
      section={long_section}
    />
  {/await}
</Story>
