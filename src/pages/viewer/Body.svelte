<script>
  import Page from "./Page";
  import SearchResults from "./SearchResults";

  import { layout, initializeViewer, cancelAnnotation } from "@/viewer/layout";
  import { doc } from "@/viewer/document";
  import ScrollZoom from "scrollzoom";
  import ActionPane from "./pane/ActionPane";
  import { onMount, onDestroy, tick } from "svelte";

  import {
    enterRedactMode,
    enterAnnotateMode,
    enterModifyMode,
    enterSectionsMode,
  } from "@/viewer/actions";

  let docElem;
  let actionHeight;
  $: actionOffset =
    actionHeight == null || $layout.action == null ? 0 : actionHeight;

  function destroyScrollzoom() {
    if (doc.scrollzoom != null) {
      doc.scrollzoom.destroy();
      doc.scrollzoom = null;
    }
  }

  function pageRendered(pageNumber) {
    doc.pageRendered(pageNumber);
  }

  function pageDestroyed(pageNumber) {
    doc.pageDestroyed(pageNumber);
  }

  function setupScrollzoom() {
    const components = doc.pages.map((page) => {
      let renderedComponent = { component: null };
      const destroy = () => {
        if (renderedComponent.component != null) {
          renderedComponent.component.$destroy();
        }
        renderedComponent.component = null;
      };
      return {
        component: {
          render({ x, y, width, height, docHeight }) {
            const div = document.createElement("div");
            div.style.position = "absolute";
            div.style.left = `${x}px`;
            div.style.top = `${y}px`;
            div.style.width = `${width}px`;
            div.style.height = `${height}px`;
            doc.docHeight = docHeight;
            doc.viewerWidth = width;
            doc.viewerScale = width / doc.layout.pageWidth;
            div.style.boxSizing = "border-box";
            destroy();
            renderedComponent.component = new Page({
              target: div,
              props: {
                page,
                x,
                y,
                width,
                height,
                callback: () => pageRendered(page.pageNumber),
                scale: doc.viewerScale,
                resizeCallback(extraHeight, width) {
                  handleExtraHeight(page, extraHeight, width);
                },
              },
            });
            return div;
          },
          update(div, { x, y, width, height, docHeight }) {
            div.style.left = `${x}px`;
            div.style.top = `${y}px`;
            div.style.width = `${width}px`;
            div.style.height = `${height}px`;
            doc.docHeight = docHeight;
            doc.viewerWidth = width;
            doc.viewerScale = width / doc.layout.pageWidth;
            if (renderedComponent.component != null) {
              renderedComponent.component.$set({
                x,
                y,
                width,
                height,
                scale: doc.viewerScale,
              });
            }
          },
          destroy() {
            destroy();
            pageDestroyed(page.pageNumber);
          },
        },
        x: page.position[0],
        y: page.position[1],
        width: page.position[2] - page.position[0],
        height: page.position[3] - page.position[1],
        page,
        renderedComponent,
      };
    });

    // Init
    destroyScrollzoom();
    doc.scrollzoom = new ScrollZoom(docElem, {
      components,
      width: doc.containerWidth,
      height: doc.containerHeight,
      changeCallback: function () {
        const renderedComponents = Object.values(this.renderedComponents);
        if (renderedComponents.length == 0) return;
        const components = renderedComponents.sort(
          (a, b) => a.page.pageNumber - b.page.pageNumber,
        );
        doc.visiblePageNumber = components[0].page.pageNumber + 1;
      },
    });
    doc.docElem = docElem;
  }

  let initialized = false;

  $: {
    if (!initialized && $doc.pages.length > 0 && docElem != null) {
      initialized = true;
      setupScrollzoom();
      if (doc.containerWidth > docElem.offsetWidth) {
        doc.zoomWidth();
      }
      tick().then(() => setTimeout(() => initializeViewer(), 0));
    }
  }

  function visualScaleCheck() {
    return window.visualViewport != null && window.visualViewport.scale > 1;
  }

  function handlePinch(e) {
    const target = e.target;
    if (
      e.ctrlKey &&
      target != docElem &&
      (!docElem.contains || !docElem.contains(target)) &&
      !visualScaleCheck()
    ) {
      e.preventDefault();
    }
  }

  const styles = [
    ["touchAction", "pan-x pan-y"],
    ["overscrollBehavior", "none"],
    ["position", "fixed"],
    ["overflow", "hidden"],
  ];
  const elements = [document.documentElement, document.body];
  const prevStyles = styles.map(() => "");
  onMount(() => {
    // Set document root styles
    for (let i = 0; i < styles.length; i++) {
      elements.forEach((element) => {
        prevStyles[i] = element.style;
        element.style[styles[i][0]] = styles[i][1];
      });
    }
    document.body.addEventListener("wheel", handlePinch, { passive: false });
  });

  onDestroy(() => {
    // Restore document root styles
    for (let i = 0; i < styles.length; i++) {
      elements.forEach((element) => {
        element.style[styles[i][0]] = prevStyles[i];
      });
    }
    document.body.removeEventListener("wheel", handlePinch, { passive: false });

    destroyScrollzoom();
  });

  async function handleExtraHeight(page, extraHeight, width) {
    if (docElem == null || doc.scrollzoom == null) return;

    // Set scale offset
    doc.scrollzoom.transform.setScaleOffset(0, extraHeight * width);

    // Get the extra height difference
    const delta = doc.extraHeights[page.pageNumber] - extraHeight;
    if (delta == 0) return;

    const topPosition =
      doc.scrollzoom.components[page.pageNumber].y - docElem.scrollTop;
    const prevHeight = doc.scrollzoom.components[page.pageNumber].height;
    doc.setExtraHeight(page.pageNumber, extraHeight);
    await tick();

    if (
      prevHeight !=
      doc.pages[page.pageNumber].position[3] -
        doc.pages[page.pageNumber].position[1]
    ) {
      const newDelta =
        doc.pages[page.pageNumber].position[3] -
        doc.pages[page.pageNumber].position[1] -
        prevHeight;
      doc.scrollzoom.components[page.pageNumber].height =
        doc.pages[page.pageNumber].position[3] -
        doc.pages[page.pageNumber].position[1];

      for (let i = page.pageNumber + 1; i < doc.pages.length; i++) {
        doc.scrollzoom.components[i].y = doc.pages[i].position[1];
      }
      doc.updateScrollZoom();

      // TODO: make smoother
      if (topPosition < 0) {
        setTimeout(
          () =>
            (docElem.scrollTop +=
              newDelta * doc.scrollzoom.transform.matrix[0]),
          0,
        );
      }
    }
  }

  function elementOrAncestorsHasExtraContent(elem) {
    // Determines if an element or any of its ancestors is extra page content
    if (
      elem.className != null &&
      (elem.className.includes("extrapagecontent") ||
        elem.className.includes("insert"))
    ) {
      return true;
    }
    if (elem.parentNode == null) return false;
    return elementOrAncestorsHasExtraContent(elem.parentNode);
  }

  function handleMouseDown(e) {
    if ($layout.displayAnnotate) {
      if (elementOrAncestorsHasExtraContent(e.target)) {
        // Ignore clicks on extra page content
        return;
      }
      cancelAnnotation();
    }
  }

  function handleKeyPress(e) {
    if (
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      !e.shiftKey &&
      !layout.disableControls &&
      !layout.searchExpanded &&
      !layout.dialogShown
    ) {
      if (e.key == "a") {
        enterAnnotateMode();
      } else if (e.key == "r") {
        enterRedactMode();
      } else if (e.key == "m") {
        enterModifyMode();
      } else if (e.key == "s") {
        enterSectionsMode();
      }
    }
  }
</script>

<style lang="scss">
  .doc {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    min-width: 1px;
    min-height: 1px;
    box-sizing: border-box;
    overflow: auto;
    z-index: $viewerBodyZ;
    touch-action: manipulation;
    background: $viewerBodyBg;

    :global(img) {
      background: white;
    }

    &.grayed {
      background: $viewerBodyBgDarker;
    }
  }
</style>

<ActionPane bind:actionHeight />

<div
  style="top: {$layout.headerHeight +
    actionOffset}px; bottom: {$layout.footerHeight}px;
  right: {$layout.sidebarWidth}px;"
  bind:this={docElem}
  class="doc"
  on:mousedown={handleMouseDown}
  class:grayed={$layout.displayAnnotate || $layout.selectNoteEmbed}
>
  {#if $doc.mode == "search"}
    <SearchResults />
  {/if}
</div>

<svelte:window
  on:gesturestart|preventDefault
  on:gesturechange|preventDefault
  on:gestureend|preventDefault
  on:keypress={handleKeyPress}
/>
