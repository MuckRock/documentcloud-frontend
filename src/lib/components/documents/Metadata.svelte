<!--
  @component
  Document metadata:

  - contributor
  - created date
  - last updated date
  - text language
-->
<script lang="ts">
  import type { Document, DocumentText } from "$lib/api/types";

  import { _ } from "svelte-i18n";

  import { LANGUAGE_MAP } from "@/config/config.js";
  import { userOrgString } from "$lib/api/documents";
  import Metadata from "../common/Metadata.svelte";

  export let document: Document;
  export let text: DocumentText;

  const ocrEngineMap = {
    tess4: "Tesseract",
    textract: "Textract",
    googlecv: "Google Cloud Vision",
    ocrspace1: "OCRSpace",
    azuredi: "Azure Document Intelligence",
    doctr: "docTR",
  };

  const engines = Object.keys(ocrEngineMap);

  let engine: string;

  $: ocrEngine =
    text?.pages
      .map((page) => page?.ocr)
      .reduce((acc, cur) => (acc = cur ?? acc), null) ?? null;

  $: engine = ocrEngine?.split("_")[0];

  function dateFormat(date: Date | string) {
    return new Date(date).toLocaleDateString();
  }
</script>

<div class="meta">
  <Metadata key={$_("sidebar.contributed")}>
    {userOrgString(document)}
  </Metadata>
  <Metadata key={$_("sidebar.created")}>
    {dateFormat(document.created_at)}
  </Metadata>
  <Metadata key={$_("sidebar.updated")}>
    {dateFormat(document.updated_at)}
  </Metadata>
  <Metadata key={$_("sidebar.language")}>
    {LANGUAGE_MAP.get(document.language)}
  </Metadata>
  {#if engine && Object.keys(ocrEngineMap).includes(engine)}
    <Metadata key={$_("sidebar.ocr_engine")}>
      {ocrEngineMap[engine]}
    </Metadata>
  {/if}
</div>

<style>
  .meta {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0 0.5rem;
  }
</style>
