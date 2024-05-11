<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import PdfPage from "../PDFPage.svelte";

  import * as pdfjs from "pdfjs-dist/build/pdf.mjs";
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url,
  ).href;
  import { pageSizesFromSpec } from "@/api/pageSize.js";

  import document from "$lib/api/fixtures/documents/examples/the-santa-anas.json";
  import textPositions from "$lib/api/fixtures/documents/examples/the-santa-anas-p1.position.json";
  import pdfFile from "$lib/api/fixtures/documents/examples/the-santa-anas.pdf";

  export const meta = {
    title: "Components / Documents / PDF Page",
    component: PdfPage,
    parameters: { layout: "centered" },
  };

  const sizes = pageSizesFromSpec(document.page_spec);
  const url = new URL(pdfFile, import.meta.url);

  async function load(url: URL) {
    return pdfjs.getDocument(url).promise;
  }
</script>

<Story name="server text">
  {#await load(url) then pdf}
    <PdfPage
      aspect={sizes[0]}
      page_number={1}
      scale={1.5}
      {pdf}
      text={textPositions}
    />
  {/await}
</Story>

<Story name="embedded text">
  {#await load(url) then pdf}
    <PdfPage aspect={sizes[0]} page_number={1} scale={1.5} {pdf} />
  {/await}
</Story>
