<script>
  import Page from "./Page";
  import RedactPane from "./pane/RedactPane";
  import AnnotatePane from "./pane/AnnotatePane";
  import { onMount } from "svelte";
  import { viewer } from "@/viewer/viewer";
  import { layout } from "@/viewer/layout";
  import { renderer } from "@/viewer/renderer";

  let body;

  let actionHeight;
  $: actionOffset = actionHeight == null ? 0 : actionHeight;

  function updateDimension() {
    $renderer.bodyHeight = body.offsetHeight;
    $renderer.top = body.scrollTop;
  }

  function handleShift({ detail: shift }) {
    body.scrollTop += shift;
  }

  onMount(() => {
    if (body.offsetWidth < $renderer.width) {
      $renderer.width = body.offsetWidth - $renderer.pageRail * 2;
    }
    updateDimension();
  });
</script>

<style lang="scss">
  .body {
    background: $viewerBodyBg;
    position: absolute;
    left: 0;
    z-index: $viewerBodyZ;
    overflow: auto;

    .actionpane {
      position: sticky;
      top: 0;
      background: #fffdea;
      z-index: 1;
      padding: 20px;
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.25);
    }
  }
</style>

<div
  class="body"
  style="top: {$layout.headerHeight}px; bottom: {$layout.footerHeight}px; right:
  {$layout.sidebarWidth}px"
  bind:this={body}
  on:scroll={updateDimension}>
  {#if $viewer.loaded}
    {#if $layout.action != null}
      <div class="actionpane" bind:clientHeight={actionHeight}>
        {#if $layout.redacting}
          <RedactPane />
        {:else if $layout.annotating}
          <AnnotatePane />
        {/if}
      </div>
    {/if}
    {#each $renderer.elementsToShow as chunk (chunk.type == 'page' ? chunk.number : `space${chunk.height}`)}
      {#if chunk.type == 'space'}
        <div style="height: {chunk.height}px" />
      {:else if chunk.type == 'page'}
        <Page
          on:shift={handleShift}
          document={$viewer.document}
          pageNumber={chunk.number}
          {actionOffset}
          aspect={$renderer.computedAspects[chunk.number].aspect} />
      {/if}
    {/each}
  {/if}
</div>

<svelte:window on:resize={updateDimension} />
