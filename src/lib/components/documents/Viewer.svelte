<script lang="ts">
  import { _ } from "svelte-i18n";
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";
  import type { Document, DocumentText, ViewerMode } from "$lib/api/types";
  import { pdfUrl, shouldPaginate } from "$lib/api/documents";
  import PageToolbar from "../common/PageToolbar.svelte";
  import Search from "../forms/Search.svelte";
  import ContentLayout from "../layouts/ContentLayout.svelte";
  import PDF from "./PDF.svelte";
  import Zoom, { zoomToScale, zoom, zoomToSize } from "./Zoom.svelte";
  import Paginator from "./Paginator.svelte";
  import SelectMode from "./SelectMode.svelte";
  import ThumbnailGrid from "./ThumbnailGrid.svelte";
  import Text from "./Text.svelte";
  import Notes from "./Notes.svelte";
  import { EyeClosed16, Note16 } from "svelte-octicons";
  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import Sections from "./Sections.svelte";

  const currentMode: Writable<ViewerMode> = getContext("currentMode");

  export let document: Document;
  export let text: Promise<DocumentText> | DocumentText;
  export let query: string = "";

  $: asset_url = pdfUrl(document);
  $: mode = $currentMode;
</script>

<div class="container">
  <ContentLayout>
    <PageToolbar slot="header">
      <SelectMode slot="left" />
      <Flex justify="end" slot="right">
        {#if document.edit_access}
          <Button ghost><Note16 /> Annotate</Button>
          <Button ghost><EyeClosed16 /> Redact</Button>
        {/if}
        <Search name="q" {query} />
      </Flex>
    </PageToolbar>
    {#if mode === "document"}
      <PDF {document} scale={zoomToScale($zoom)} {asset_url} {query} />
    {:else if mode === "text"}
      <Text {text} zoom={+$zoom || 1} total={document.page_count} {query} />
    {:else if mode === "grid"}
      <ThumbnailGrid {document} size={zoomToSize($zoom)} />
    {:else if mode === "notes"}
      <Notes {document} {asset_url} />
    {/if}
    <PageToolbar slot="footer">
      <svelte:fragment slot="left">
        {#if mode === "document"}
          <Sections {document} />
        {/if}
      </svelte:fragment>~
      <svelte:fragment slot="center">
        {#if shouldPaginate(mode)}
          <Paginator totalPages={document.page_count} />
        {/if}
      </svelte:fragment>

      <Zoom slot="right" {mode} />
    </PageToolbar>
  </ContentLayout>
</div>

<style>
  .container {
    height: 100%;
    min-height: 100%;
  }
</style>
