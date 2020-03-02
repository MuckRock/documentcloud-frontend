<script>
  import Tooltip from "@/common/Tooltip";
  import NoWhitespace from "@/common/NoWhitespace";

  import Page from "./Page";
  import RedactPane from "./pane/RedactPane";
  import AnnotatePane from "./pane/AnnotatePane";
  import SearchPane from "./pane/SearchPane";
  import SearchResults from "./SearchResults";
  import { onMount, tick } from "svelte";
  import { viewer } from "@/viewer/viewer";
  import { layout, cancelActions } from "@/viewer/layout";
  import {
    renderer,
    scroll,
    zoomFit,
    showSidebar,
    restorePosition,
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

    let willZoom = body.offsetWidth < renderer.width;
    if (willZoom) {
      await zoomFit();
    }

    if (body.offsetWidth < BREAKPOINT) {
      await showSidebar(false);
    }
    // Set original width
    renderer.originalWidth = renderer.width;
    await updateDimension();

    if (willZoom) {
      // Zoom twice to fix issue if rails go away in the middle
      await zoomFit();
    }
  });

  let gestureStartZoom = 100;
  const MAX_ZOOM = 3;
  const MIN_ZOOM = 0.5;
  const ZOOM_RESISTANCE = 0.15; // if within this factor of 1, jump to 1 at end
  let currentZoom = 1;
  let startZooming = false;
  $: zoomAmount = Math.round(currentZoom * 10) * 10;
  $: {
    if (startZooming) {
      (async () => {
        await zoomFit(true, zoomAmount / 100);
        await updateDimension();
      })();
    }
  }

  function handleZoom(scale) {
    if (gestureStartZoom == null) return;
    // Apply curve on scale
    scale = Math.pow(scale, 1);
    scale = Math.min(MAX_ZOOM / gestureStartZoom, scale);
    scale = Math.max(MIN_ZOOM / gestureStartZoom, scale);
    currentZoom = scale * gestureStartZoom;
  }

  function handleGestureStart(e) {
    if (e.scale != null) {
      gestureStartZoom = currentZoom;
      startZooming = true;
      handleZoom(e.scale);
    }
  }

  function handleGestureChange(e) {
    if (e.scale != null) {
      handleZoom(e.scale);
    } else {
      handleGestureEnd();
    }
  }

  async function handleGestureEnd() {
    console.log(currentZoom);
    if (Math.abs(currentZoom - 1) <= ZOOM_RESISTANCE) {
      currentZoom = 1;
      await tick();
    }

    gestureStartZoom = null;
    startZooming = false;
  }

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
    touch-action: pan-x pan-y;

    &.textmode {
      touch-action: initial;
    }

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

  .searchresults {
    $width: 25px;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: $width;
    z-index: 2;
    pointer-events: none;

    .result {
      $height: 5px;
      position: absolute;
      height: $height;

      > :global(span) {
        display: block;
      }

      :global(.highlight) {
        font-weight: bold;
      }

      .bubble {
        @include buttonLike;

        background: rgba($annotationBorder, 0.7);
        height: $height;
        width: $width;
        border: solid 1px darken($annotationBorder, 10%);
        box-sizing: border-box;
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.12);
        border-radius: 3px;
        pointer-events: all;
      }
    }
  }
</style>

<div
  class="body"
  class:grayed={$layout.displayAnnotate}
  class:textmode={$renderer.mode != 'image'}
  style="top: {$layout.headerHeight}px; bottom: {$layout.footerHeight}px; right:
  {$layout.sidebarWidth}px"
  class:scrollable
  bind:this={body}
  on:gesturestart={handleGestureStart}
  on:gesturechange={handleGestureChange}
  on:gestureend={handleGestureEnd}
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
          {:else if $layout.searching}
            <SearchPane />
          {/if}
        </div>
      </div>
    {/if}
    {#if $renderer.mode == 'image' || $renderer.mode == 'text'}
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
    {:else if $renderer.mode == 'search'}
      <SearchResults />
    {/if}
  {/if}
</div>

<!-- Search results -->
{#if $layout.searchPages != null && $renderer.mode != 'search'}
  <div
    class="searchresults"
    style="top: {$layout.headerHeight}px; bottom: {$layout.footerHeight}px;
    right: {$layout.sidebarWidth}px">
    {#each $layout.searchPages as { page }}
      {#each $layout.searchHighlights[page] as highlight, offset}
        <div
          class="result"
          style="top: {(($renderer.overallHeights[page] + ((page < $renderer.overallHeights.length - 1 ? $renderer.overallHeights[page + 1] - $renderer.overallHeights[page] : $renderer.overallHeight - $renderer.overallHeights[page]) * offset) / $layout.searchHighlights[page].length) / $renderer.overallHeight) * 100}%"
          on:click={() => restorePosition(page)}>
          <Tooltip
            offsetTop={$layout.headerHeight}
            offsetRight={$layout.sidebarWidth}>
            <div slot="caption" style="max-width: 150px">
              <span>p. {page + 1} –</span>
              <NoWhitespace>
                {#each highlight as passage}
                  <span class:highlight={passage.type == 'highlight'}>
                    {passage.text}
                  </span>
                {/each}
              </NoWhitespace>
            </div>
            <div class="bubble" />
          </Tooltip>
        </div>
      {/each}
    {/each}
  </div>
{/if}

<svelte:window
  on:resize={handleResize}
  on:keydown={handleKeyDown}
  on:mouseout={handleGestureEnd}
  on:touchend={handleGestureEnd} />
