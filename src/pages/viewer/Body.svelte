<script>
  import Page from "./Page";
  import RedactPane from "./pane/RedactPane";
  import AnnotatePane from "./pane/AnnotatePane";
  import { onMount } from "svelte";
  import { viewer } from "@/viewer/viewer";
  import { layout, cancelActions } from "@/viewer/layout";
  import {
    renderer,
    scroll,
    zoomFit,
    showSidebar,
    ZOOM_OPTIONS,
    BREAKPOINT
  } from "@/viewer/renderer";

  // SVG assets
  import closeSvg from "@/assets/close.svg";

  let body;

  let actionHeight;
  $: actionOffset =
    actionHeight == null || $layout.action == null ? 0 : actionHeight;

  $: scrollable = $renderer.width - $layout.sidebarWidth > 0;

  function updateDimension() {
    if (!scrollable) return;

    if (renderer.blockScrollEvent) {
      // Block scroll events if flag is set
      renderer.blockScrollEvent = false;
      return;
    }
    renderer.top = body.scrollTop;
    renderer.bodyHeight = body.offsetHeight;
  }

  let zoomTimeout = null;

  function handleResize() {
    if (renderer.zoom == ZOOM_OPTIONS[0]) {
      // Zoom fit
      if (zoomTimeout != null) {
        clearTimeout(zoomTimeout);
        zoomTimeout = null;
      }
      zoomTimeout = setTimeout(() => {
        zoomFit();
        zoomTimeout = null;
      }, 50);
    }
    updateDimension();
  }

  async function handleShift({ detail: shift }) {
    // Don't handle shifts that would jar away from document edges
    if (body.scrollTop == 0) return;
    if (body.scrollTop + body.offsetHeight == body.scrollHeight) return;

    await scroll(renderer.top + shift);
  }

  function handleKeyDown(e) {
    if (e.key == "Escape") cancelActions();
  }

  onMount(async () => {
    renderer.elem = body;
    if (body.offsetWidth < renderer.width) {
      zoomFit();
    }
    if (body.offsetWidth < BREAKPOINT) {
      await showSidebar(false);
    }
    updateDimension();
  });

  // Give spaces a unique ID in the keyed each block below
  let spaceId = 1;
</script>

<style lang="scss">
  .body {
    background: $viewerBodyBg;
    position: absolute;
    left: 0;
    z-index: $viewerBodyZ;
    overflow: hidden;
    -webkit-overflow-scrolling: touch;

    &.scrollable {
      overflow: auto;
    }

    &.grayed {
      background: $viewerBodyBgDarker;
    }

    .actionpane {
      position: sticky;
      top: 0;
      background: #fffdea;
      z-index: $viewerActionPaneZ;
      padding: 20px;
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.25);
      display: table;
      width: 100%;
      box-sizing: border-box;

      > * {
        display: table-cell;
        vertical-align: top;
      }

      .actioncontent {
        padding: 0 25px;
        width: 100%;

        :global(h3) {
          font-size: 16px;
          margin: 0;
          margin: 12px 0;
          color: $viewerDarkGray;
        }

        :global(p) {
          font-size: 14px;
          color: $viewerDarkGray;
        }

        :global(.buttonpadded) {
          margin: 0 -4px;

          :global(button) {
            margin: 0 4px;
          }
        }
      }
    }
  }
</style>

<div
  class="body"
  class:grayed={$layout.displayAnnotate}
  style="top: {$layout.headerHeight}px; bottom: {$layout.footerHeight}px; right:
  {$layout.sidebarWidth}px"
  class:scrollable
  bind:this={body}
  on:scroll={updateDimension}>
  {#if $viewer.loaded}
    <!-- Action pane -->
    {#if $layout.action != null}
      <div class="actionpane" bind:clientHeight={actionHeight}>
        <div class="actionclose">
          <span on:click={cancelActions}>
            {@html closeSvg}
          </span>
        </div>
        <div class="actioncontent">
          {#if $layout.redacting}
            <RedactPane />
          {:else if $layout.annotating}
            <AnnotatePane />
          {/if}
        </div>
      </div>
    {/if}
    <!-- Page contents -->
    {#each $renderer.elementsToShow as chunk (chunk.type == 'page' ? `${renderer.mode}-${chunk.number}` : `space-${spaceId++}`)}
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

<svelte:window on:resize={handleResize} on:keydown={handleKeyDown} />
