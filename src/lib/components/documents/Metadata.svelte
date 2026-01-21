<!--
  @component
  Document metadata:

  - contributor
  - created date
  - last updated date
  - text language
-->
<script lang="ts">
  import type { Document, DocumentText, Maybe } from "$lib/api/types";

  import { _ } from "svelte-i18n";

  import { LANGUAGE_MAP } from "@/config/config.js";
  import { userOrgString } from "$lib/api/documents";
  import Metadata from "../common/Metadata.svelte";
  import { LinkExternal16 } from "svelte-octicons";

  interface Props {
    document: Document;
    text: Maybe<DocumentText>;
  }

  let { document, text }: Props = $props();

  const ocrEngineMap = {
    tess4: "Tesseract",
    textract: "Textract",
    googlecv: "Google Cloud Vision",
    ocrspace1: "OCRSpace",
    azuredi: "Azure Document Intelligence",
    doctr: "docTR",
  };

  let ocrEngine = $derived(
    text?.pages
      .map((page) => page?.ocr)
      .reduce((acc, cur) => (acc = cur ?? acc), null) ?? null,
  );

  let engine: Maybe<string> = $derived(ocrEngine?.split("_")[0]);

  function dateFormat(date: Date | string) {
    return new Date(date).toLocaleDateString();
  }
</script>

<div class="meta">
  {#if document.published_url}
    <Metadata key={$_("edit.fields.published_url")}>
      <a href={document.published_url} class="publishedUrl" target="_blank">
        {new URL(document.published_url).hostname}
        <LinkExternal16 height={12} width={12} />
      </a>
    </Metadata>
  {/if}
  {#if document.source}
    <Metadata key={$_("edit.fields.source")}>
      {document.source}
    </Metadata>
  {/if}
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
    padding: 0 0.5rem 1rem 0;
  }
  .publishedUrl {
    display: flex;
    align-items: center;
    fill: var(--blue-3);
    gap: 0.25rem;
  }
</style>
