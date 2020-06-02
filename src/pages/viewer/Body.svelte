<script>
  import Page from "./Page";

  import { panZoom } from "@/viewer/gestures";
  import { layout } from "@/viewer/layout";
  import { transform } from "@/viewer/transform";
  import { doc } from "@/viewer/document";

  let body;
  let bodyWidth;
  let bodyHeight;

  $: {
    if (bodyWidth != null && bodyHeight != null) {
      transform.viewportSize = [bodyWidth, bodyHeight];
      transform.ensureBounds();
    }
  }
</script>

<style lang="scss">
  .body,
  .container,
  .scrollcontainer {
    background: $viewerBodyBg;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    overflow: hidden;
    user-select: none;
    z-index: $viewerBodyZ;
    touch-action: manipulation;
  }

  .scrollcontainer {
    overflow: scroll;
    z-index: $viewerScrollContainerZ;
    background: none;
    overscroll-behavior: none;
  }

  .container {
    pointer-events: none;
  }
</style>

<div
  class="body"
  bind:offsetWidth={bodyWidth}
  bind:offsetHeight={bodyHeight}
  style="top: {$layout.headerHeight}px; bottom: {$layout.footerHeight}px; right:
  {$layout.sidebarWidth}px"
  bind:this={body}>
  <div
    class="scrollcontainer"
    use:panZoom={{ workspace: null, transform, workspaceElem: body }}>
    <div />
  </div>
  <div class="container">
    {#each $transform.visiblePages as page (page.pageNumber)}
      <Page {page} {bodyWidth} transform={$transform} />
    {/each}
  </div>
</div>
