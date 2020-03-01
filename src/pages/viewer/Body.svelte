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

  let gestureStartZoom = null;
  const MAX_ZOOM = 3;
  const MIN_ZOOM = 0.5;
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
    scale = Math.pow(scale, 0.3);
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
    }
  }

  function handleGestureEnd(e) {
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

    &.scrollable {
      overflow: auto;
    }

    &.grayed {
      background: $viewerBodyBgDarker;
    }

    &.blurred {
      filter: blur(1px);
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

  .zoominfo {
    position: absolute;
    display: table;
    pointer-events: none;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background: rgba(0, 128, 0, 0.74);
    // background: linear-gradient(rgba(0, 128, 0, 0.74), rgba(0, 51, 0, 0.8));
    background: linear-gradient(
      rgba(lighten($viewerLink, 10%), 0.6),
      rgba($viewerLink, 0.7)
    );
    text-shadow: 0 1px 0 black, 0 0 2px rgba(0, 0, 0, 0.12);

    > div {
      display: table-cell;
      vertical-align: middle;
      width: 100%;
      height: 100%;
      color: white;
      font-size: 40px;
      text-align: center;
      letter-spacing: 3px;
    }

    .bar {
      position: absolute;
      top: 30%;
      height: 8%;
      left: 0;
      right: 0;
      z-index: -1;
      border: solid 1px white;
      box-sizing: border-box;

      .rect {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 5%;
        border: solid 1px white;
        box-sizing: border-box;
        background: rgba(255, 255, 255, 0.25);
        z-index: 1;
        margin-left: -5%;

        &.solid {
          background: rgba(255, 255, 255, 0.75);
        }
      }
    }
  }
</style>

<div
  class="body"
  class:blurred={gestureStartZoom != null}
  class:grayed={$layout.displayAnnotate}
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
{#if gestureStartZoom != null}
  <div class="zoominfo">
    <div>{zoomAmount}%</div>
    <div class="bar">
      <div
        class="rect"
        class:solid={zoomAmount == 100}
        style="left: {zoomAmount >= 100 ? ((zoomAmount - 100) / 100 / (MAX_ZOOM - 1)) * 50 + 50 : (zoomAmount / 100 - MIN_ZOOM) * (MIN_ZOOM / 0.5) * 100 * (50 / 55) + 5}%" />
    </div>
  </div>
{/if}

<svelte:window
  on:resize={handleResize}
  on:keydown={handleKeyDown}
  on:mouseout={handleGestureEnd}
  on:touchend={handleGestureEnd} />
