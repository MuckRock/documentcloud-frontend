<!-- @component
Assumes it's a child of a ViewerContext
 -->

<script lang="ts">
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
  import { getCurrentMode, isEmbedded } from "./ViewerContext.svelte";

  const embed = isEmbedded();
  const currentMode = getCurrentMode();

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
    {/if}
    <svelte:fragment slot="footer">
      {#if mode !== "notes"}
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
