<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Document, DocumentText, ViewerMode } from "$lib/api/types";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { Comment16, EyeClosed16 } from "svelte-octicons";

  import AnnotationToolbar from "./toolbars/AnnotationToolbar.svelte";
  import Flex from "../common/Flex.svelte";
  import Button from "../common/Button.svelte";
  import ContentLayout from "../layouts/ContentLayout.svelte";
  import Notes from "./Notes.svelte";
  import PageToolbar from "../common/PageToolbar.svelte";
  import Paginator from "./Paginator.svelte";
  import PDF from "./PDF.svelte";
  import RedactionToolbar from "./toolbars/RedactionToolbar.svelte";
  import Search from "../forms/Search.svelte";
  import Sections from "./Sections.svelte";
  import SelectMode from "./SelectMode.svelte";
  import Text from "./Text.svelte";
  import ThumbnailGrid from "./ThumbnailGrid.svelte";
  import Zoom, { zoomToScale, zoom, zoomToSize } from "./Zoom.svelte";

  import { pdfUrl, shouldPaginate } from "$lib/api/documents";

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
        <PageToolbar>
          <SelectMode slot="left" />
          <Flex justify="end" slot="right">
            <Search name="q" {query} />
            {#if !embed && document.edit_access}
              <Button ghost href="?mode=annotating">
                <Comment16 />
                {$_("mode.annotating")}
              </Button>
              <Button ghost href="?mode=redacting">
                <EyeClosed16 />
                {$_("mode.redacting")}
              </Button>
            {/if}
          </Flex>
        </PageToolbar>
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

    <PageToolbar slot="footer">
      <svelte:fragment slot="left">
        {#if mode === "document"}
          <Sections {document} />
        {/if}
      </svelte:fragment>
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
