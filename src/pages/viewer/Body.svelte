<script>
  import Page from "./Page";

  // import { panZoom } from "@/viewer/gestures";
  import { layout } from "@/viewer/layout";
  // import { transform } from "@/viewer/transform";
  import { doc } from "@/viewer/document";
  import ScrollZoom from "scrollzoom";
  import { onMount, onDestroy } from "svelte";

  let body;
  let bodyWidth;
  let bodyHeight;

  let docElem;

  let scrollzoom = null;

  function destroyScrollzoom() {
    if (scrollzoom != null) {
      scrollzoom.destroy();
      scrollzoom = null;
    }
  }

  function setupScrollzoom() {
    const components = doc.pages.map(page => {
      let renderedComponent = null;
      const destroy = () => {
        if (renderedComponent != null) renderedComponent.$destroy();
        renderedComponent = null;
      };
      return {
        component: {
          render({ x, y, width, height }) {
            const div = document.createElement("div");
            div.style.position = "absolute";
            div.style.background = "white";
            div.style.left = `${x}px`;
            div.style.top = `${y}px`;
            div.style.width = `${width}px`;
            div.style.height = `${height}px`;
            div.style.border = "solid 1px gainsboro";
            div.style.boxSizing = "border-box";
            destroy();
            renderedComponent = new Page({
              target: div,
              props: {
                page,
                x,
                y,
                width,
                height
              }
            });
            return div;
          },
          update(div, { x, y, width, height }) {
            div.style.left = `${x}px`;
            div.style.top = `${y}px`;
            div.style.width = `${width}px`;
            div.style.height = `${height}px`;
            if (renderedComponent != null) {
              renderedComponent.$set({
                x,
                y,
                width,
                height
              });
            }
          },
          destroy() {
            destroy();
          }
        },
        x: page.position[0],
        y: page.position[1],
        width: page.position[2] - page.position[0],
        height: page.position[3] - page.position[1]
      };
    });

    // Init
    destroyScrollzoom();
    scrollzoom = new ScrollZoom(docElem, {
      components,
      width: $doc.containerWidth,
      height: $doc.containerHeight
    });
  }

  let initialized = false;

  $: {
    if (!initialized && $doc.pages.length > 0 && docElem != null) {
      initialized = true;
      setupScrollzoom();
    }
  }

  function handlePinch(e) {
    const target = e.target;
    if (
      e.ctrlKey &&
      (target != docElem && (!docElem.contains || !docElem.contains(target)))
    ) {
      e.preventDefault();
    }
  }

  const styles = [
    ["touchAction", "pan-x pan-y"],
    ["overscrollBehavior", "none"],
    ["position", "fixed"],
    ["overflow", "hidden"]
  ];
  const elements = [document.documentElement, document.body];
  const prevStyles = styles.map(() => "");
  onMount(() => {
    // Set document root styles
    for (let i = 0; i < styles.length; i++) {
      elements.forEach(element => {
        prevStyles[i] = element.style;
        element.style[styles[i][0]] = styles[i][1];
      });
    }
    document.body.addEventListener("wheel", handlePinch, { passive: false });
  });

  onDestroy(() => {
    // Restore document root styles
    for (let i = 0; i < styles.length; i++) {
      elements.forEach(element => {
        element.style[styles[i][0]] = prevStyles[i];
      });
    }
    document.body.removeEventListener("wheel", handlePinch, { passive: false });

    destroyScrollzoom();
  });
</script>

<style lang="scss">
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
    background: $viewerBodyBg;

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
    class="scrollcontainer"
    use:panZoom={{ workspace: null, transform, workspaceElem: body }}>
    <div />
  </div>
  <div class="container">
    {#each $transform.visiblePages as page (page.pageNumber)}
      <Page {page} {bodyWidth} transform={$transform} />
    {/each}
  </div>
</div> -->
