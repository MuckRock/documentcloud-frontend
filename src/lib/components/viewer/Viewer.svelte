<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Document, DocumentText, ViewerMode } from "$lib/api/types";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { SidebarExpand16 } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import { sidebars } from "$lib/components/layouts/Sidebar.svelte";

  // modes
  import PDF from "./PDF.svelte";
  import Text from "./Text.svelte";
  import Grid from "./Grid.svelte";
  import Notes from "./Notes.svelte";

  // toolbars
  import AnnotationToolbar from "./AnnotationToolbar.svelte";
  import PaginationToolbar from "./PaginationToolbar.svelte";
  import ReadingToolbar from "./ReadingToolbar.svelte";
  import RedactionToolbar from "./RedactionToolbar.svelte";

  // utils
  import { zoomToScale, zoom, zoomToSize } from "./Zoom.svelte";
  import { pdfUrl } from "$lib/api/documents";
  import { isEmbedded } from "@/lib/utils/viewer";

  const currentMode: Writable<ViewerMode> = getContext("currentMode");

  export let document: Document;
  export let asset_url: URL = pdfUrl(document);
  export let query: string = "";
  export let text: DocumentText;
  export let embed = isEmbedded();

  $: mode = $currentMode;
  $: showPDF = ["document", "annotating", "redacting"].includes($currentMode);
</script>

<div class="container">
  <ContentLayout>
    <!-- toolbars -->
    <Flex slot="header">
      {#if !embed && $sidebars["navigation"] === false}
        <div class="toolbar w-auto">
          <Button
            ghost
            minW={false}
            on:click={() => ($sidebars["navigation"] = true)}
          >
            <span class="flipV">
              <SidebarExpand16 />
            </span>
          </Button>
        </div>
      {/if}
      {#if !embed && mode === "annotating"}
        <AnnotationToolbar />
      {:else if !embed && mode === "redacting"}
        <RedactionToolbar {document} />
      {:else}
        <ReadingToolbar {document} {query} {embed} />
      {/if}
      {#if !embed && $sidebars["action"] === false}
        <div class="toolbar w-auto">
          <Button
            ghost
            minW={false}
            on:click={() => ($sidebars["action"] = true)}
          >
            <SidebarExpand16 />
          </Button>
        </div>
      {/if}
    </Flex>

    <!-- content -->
    {#if showPDF}
      <PDF {document} scale={zoomToScale($zoom)} {asset_url} {query} {embed} />
    {:else if mode === "text"}
      <Text {document} {text} zoom={+$zoom || 1} {query} {embed} />
    {:else if mode === "grid"}
      <Grid {document} size={zoomToSize($zoom)} {embed} />
    {:else if mode === "notes"}
      <Notes {document} {asset_url} {embed} />
    {/if}
    <svelte:fragment slot="footer">
      {#if mode !== "notes"}
        <PaginationToolbar {document} {embed} />
      {/if}
    </svelte:fragment>
  </ContentLayout>
</div>

<style>
  .container {
    height: 100%;
    min-height: 100%;
  }
  .flipV {
    display: flex;
    transform: rotate(180deg);
  }
</style>
