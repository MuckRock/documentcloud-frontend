<!-- @component
The document viewer.

Assumes it's a child of a ViewerContext
-->

<script lang="ts">
  import { onMount } from "svelte";
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
  import {
    getCurrentMode,
    getPDFProgress,
    isEmbedded,
  } from "./ViewerContext.svelte";
  import LoadingToolbar from "./LoadingToolbar.svelte";
  import Search from "./Search.svelte";

  const embed = isEmbedded();
  const currentMode = getCurrentMode();
  const progress = getPDFProgress();

  // only show loading for slow-loading pages
  let showLoading = false;

  $: mode = $currentMode;
  $: showPDF = ["document", "annotating", "redacting"].includes($currentMode);
  $: loading = $progress.total > 0 ? $progress.loaded / $progress.total : null;

  onMount(() => {
    const timeout = setTimeout(() => (showLoading = true), 500);
    return () => clearTimeout(timeout);
  });
</script>

<div class="container">
  <ContentLayout noBgColor>
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
      {#if showLoading && loading && loading < 1}
        <LoadingToolbar progress={loading} />
      {:else if !embed && mode === "annotating"}
        <AnnotationToolbar />
      {:else if !embed && mode === "redacting"}
        <RedactionToolbar />
      {:else}
        <ReadingToolbar />
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
      <PDF />
    {:else if mode === "text"}
      <Text />
    {:else if mode === "grid"}
      <Grid />
    {:else if mode === "notes"}
      <Notes />
    {:else if mode === "search"}
      <Search />
    {/if}
    <svelte:fragment slot="footer">
      {#if !["notes", "search"].includes(mode)}
        <PaginationToolbar />
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
