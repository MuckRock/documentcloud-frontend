<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Document, DocumentText, ViewerMode } from "$lib/api/types";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";

  import ContentLayout from "../layouts/ContentLayout.svelte";
  import Notes from "./Notes.svelte";
  import PDF from "./PDF.svelte";
  import Text from "./Text.svelte";
  import ThumbnailGrid from "./ThumbnailGrid.svelte";
  import { zoomToScale, zoom, zoomToSize } from "./Zoom.svelte";
  import RedactionToolbar from "./toolbars/RedactionToolbar.svelte";
  import ReadingToolbar from "./toolbars/ReadingToolbar.svelte";
  import AnnotationToolbar from "./toolbars/AnnotationToolbar.svelte";

  import { pdfUrl } from "$lib/api/documents";
  import PaginationToolbar from "./toolbars/PaginationToolbar.svelte";

  const currentMode: Writable<ViewerMode> = getContext("currentMode");

  export let document: Document;
  export let asset_url: URL = pdfUrl(document);
  export let text: Promise<DocumentText> | DocumentText;
  export let query: string = "";
  export let embed: boolean = getContext("embed") ?? false; // are we embedded?

  $: mode = $currentMode;
  $: showPDF = ["document", "annotating", "redacting"].includes(mode);
</script>

<div class="container">
  <ContentLayout>
    <!-- toolbars -->
    <div slot="header">
      {#if mode === "annotating"}
        <AnnotationToolbar />
      {:else if mode === "redacting"}
        <RedactionToolbar {document} />
      {:else}
        <ReadingToolbar {document} {query} />
      {/if}
    </div>

    <!-- content -->
    {#if showPDF}
      <PDF {document} scale={zoomToScale($zoom)} {asset_url} {query} />
    {:else if mode === "text"}
      <Text {text} zoom={+$zoom || 1} total={document.page_count} {query} />
    {:else if mode === "grid"}
      <ThumbnailGrid {document} size={zoomToSize($zoom)} />
    {:else if mode === "notes"}
      <Notes {document} {asset_url} />
    {/if}

    <PaginationToolbar {document} slot="footer" />
  </ContentLayout>
</div>

<style>
  .container {
    height: 100%;
    min-height: 100%;
  }
</style>
