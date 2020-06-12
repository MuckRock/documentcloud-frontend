<script>
  import Page from "./BlankPage";
  import { pageImageUrl } from "@/api/viewer";

  // import { panZoom } from "@/viewer/gestures";
  import { layout } from "@/viewer/layout";
  // import { transform } from "@/viewer/transform";
  import { doc } from "@/viewer/document";
  import ScrollZoom from "scrollzoom";

  let body;
  let bodyWidth;
  let bodyHeight;

  let docElem;

  $: {
    if ($doc.pages.length > 0) {
      const components = $doc.pages.map(page => {
        return {
          component: {
            render({ x, y, width, height }) {
              console.log("r", x, y, width, height);
              const div = document.createElement("img");
              div.style.position = "absolute";
              div.style.background = "gainsboro";
              div.style.left = `${x}px`;
              div.style.top = `${y}px`;
              div.style.width = `${width}px`;
              div.style.height = `${height}px`;
              div.style.border = "solid 1px gainsboro";
              div.style.boxSizing = "border-box";
              div.src = pageImageUrl(page.document, page.pageNumber, 2000);
              return div;
            },
            update(div, { x, y, width, height }) {
              console.log("u", x, y, width, height);
              div.style.left = `${x}px`;
              div.style.top = `${y}px`;
              div.style.width = `${width}px`;
              div.style.height = `${height}px`;
            }
          },
          x: page.position[0],
          y: page.position[1],
          width: page.position[2] - page.position[0],
          height: page.position[3] - page.position[1]
        };
      });
      console.log(components);

      // Init
      const scrollzoom = new ScrollZoom(docElem, {
        components,
        width: $doc.containerWidth,
        height: $doc.containerHeight
      });
    }
  }

  // $: {
  //   if (bodyWidth != null && bodyHeight != null) {
  //     transform.viewportSize = [bodyWidth, bodyHeight];
  //     transform.ensureBounds();
  //   }
  // }
</script>

<style lang="scss">
  // .body,
  // .container,
  // .scrollcontainer {
  //   background: $viewerBodyBg;
  //   position: absolute;
  //   top: 0;
  //   bottom: 0;
  //   right: 0;
  //   left: 0;
  //   overflow: hidden;
  //   user-select: none;
  //   z-index: $viewerBodyZ;
  //   touch-action: manipulation;
  // }

  // .scrollcontainer {
  //   overflow: scroll;
  //   z-index: $viewerScrollContainerZ;
  //   background: none;
  //   overscroll-behavior: none;
  // }

  // .container {
  //   pointer-events: none;
  // }

  // TODO: refactor to only affect viewer
  :global(body, html, :root) {
    touch-action: pan-x pan-y;
    overscroll-behavior: none;
  }

  .doc {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    box-sizing: border-box;
    overflow: scroll;
    z-index: $viewerBodyZ;
    touch-action: manipulation;
    background: rgb(165, 165, 165);

    :global(img) {
      background: white;
    }
  }
</style>

<div
  style="top: {$layout.headerHeight}px; bottom: {$layout.footerHeight}px; right:
  {$layout.sidebarWidth}px"
  bind:this={docElem}
  class="doc" />

<!-- <div
  class="body"
  bind:offsetWidth={bodyWidth}
  bind:offsetHeight={bodyHeight}
  style="top: {$layout.headerHeight}px; bottom: {$layout.footerHeight}px; right:
  {$layout.sidebarWidth}px"
  bind:this={body}>
  <div
    class="container"
    use:panZoom={{ workspace: null, transform, workspaceElem: body }}>
    {#each $transform.visiblePages as page (page.pageNumber)}
      <Page {page} {bodyWidth} transform={$transform} />
    {/each}
  </div>
</div> -->
