<script>
  import Image from "@/common/Image";
  import ActionPane from "./pane/ActionPane";
  import { layout } from "@/viewer/layout";
  import { viewer } from "@/viewer/viewer";
  import { pageImageUrl } from "@/api/viewer";
  import { restorePosition, changeMode } from "@/viewer/document";
  import { PageSpec, Range } from "@/viewer/modification/pageSpec";

  $: modify = $layout.modifying;

  // Layout
  let actionHeight = 0;
  $: actionOffset =
    actionHeight == null || $layout.action == null ? 0 : actionHeight;
  let containerWidth = null;
  let containerHeight = null;
  let container = null;
  let containerScrollTop = 0;
  const itemWidth = 144;
  const itemHeight = 179;
  $: itemsPerRow =
    containerWidth == null
      ? null
      : Math.max(Math.floor((containerWidth - 60) / itemWidth), 1);
  $: paddingLeft =
    containerWidth == null || itemsPerRow == null
      ? 0
      : (containerWidth - itemsPerRow * itemWidth) / 2 + (modify ? -5 : -15);
  $: paddingTop =
    startPage == null || itemsPerRow == null
      ? 0
      : (startPage / itemsPerRow) * itemHeight;

  // Page objects
  let pageSpec = null;
  $: {
    if (pageSpec == null && $viewer.document.pageCount != null) {
      // Init page spec
      pageSpec = new PageSpec([new Range(0, $viewer.document.pageCount - 1)]);
      pageSpec = pageSpec.concat(pageSpec);
    }
  }
  $: pageCount = pageSpec == null ? 0 : pageSpec.length();
  $: pageSpecString = pageSpec == null ? "" : pageSpec.spec();
  $: startPage =
    itemsPerRow == null
      ? null
      : Math.min(
          Math.floor(containerScrollTop / itemHeight) * itemsPerRow,
          pageCount
        );
  $: endPage =
    itemsPerRow == null || containerHeight == null
      ? null
      : Math.min(
          Math.ceil((containerScrollTop + containerHeight) / itemHeight) *
            itemsPerRow,
          pageCount
        );
  $: overallHeight =
    itemsPerRow == null
      ? null
      : Math.ceil(pageCount / itemsPerRow) * itemHeight;
  $: paddingBottom =
    overallHeight == null || endPage == null || itemsPerRow == null
      ? 0
      : overallHeight - Math.ceil(endPage / itemsPerRow) * itemHeight;
  $: pages =
    startPage == null ||
    endPage == null ||
    itemsPerRow == null ||
    pageSpec == null
      ? []
      : pageSpec
          .slice(startPage, endPage - startPage + 1)
          .toNumbers()
          .map((pg, i) => ({ pg, index: i + startPage }));

  $: showInserts = !$layout.modifyHasSelection;

  function handleScroll() {
    if (container == null) return;
    containerScrollTop = container.scrollTop;
  }

  let lastSelected = null;
  async function select(page, shift = false, selectState = null) {
    if (!modify) {
      // Jump to page
      await changeMode("image");
      await restorePosition(page);
      return;
    }

    selectState = selectState || !$layout.modifySelectedMap[page];
    if (selectState) {
      if (shift && lastSelected != null) {
        // Shift selection
        if (lastSelected < page) {
          // Forwards selection
          for (let i = lastSelected + 1; i < page; i++) {
            $layout.modifySelectedMap[i] = true;
          }
        } else {
          // Backwards selection
          for (let i = lastSelected - 1; i > page; i--) {
            $layout.modifySelectedMap[i] = true;
          }
        }
      }
      lastSelected = page;
    } else {
      lastSelected = null;
    }
    $layout.modifySelectedMap = {
      ...$layout.modifySelectedMap,
      [page]: selectState,
    };
  }
</script>

<style lang="scss">
  .doc {
    left: 0;
    background: $viewerBodyBg;
    position: absolute;
    overflow: auto;
    padding: 2em 0;
    text-align: left;
    white-space: nowrap;
    overflow-x: hidden;
    user-select: none;

    $thumbwidth: 84px;
    $thumbheight: 119px;
    $pgmargin: 20px;
    $thumbmargin: 30px;

    :global(img) {
      width: $thumbwidth;
      height: $thumbheight;
    }

    .item {
      display: inline-block;
      overflow: visible;
    }

    .imgwrap {
      background: white;
      outline: $normaloutline;
      box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.12);
      margin: $thumbmargin;
      display: inline-block;
      position: relative;
      box-sizing: border-box;
      border: solid 2px transparent;
      cursor: pointer;

      &:hover,
      &.selected {
        border: solid 2px $primary;
      }

      .pgnum {
        position: absolute;
        top: -20px;
        width: $thumbwidth - $pgmargin * 2;
        left: $pgmargin;
        font-weight: bold;
        font-size: 13px;

        &.left {
          left: 0;
        }
      }

      .selector {
        $radius: 15px;
        position: absolute;
        top: -$radius;
        left: -$radius;
        width: $radius * 2;
        height: $radius * 2;
        border-radius: $radius;
        box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.12);
        background: #ffffff;
        border: 3px solid #5892e9;
        box-sizing: border-box;
        z-index: 1;
      }

      &.selected {
        &:after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba($primary, 0.5);
        }

        .selector {
          background: $primary;
          border: 3px solid #bcd7ff;
        }
      }

      .insert {
        $width: 2px;
        position: absolute;
        top: 0;
        bottom: 0;
        border: $width dashed rgba(0, 0, 0, 0.1);

        &.before {
          left: -$thumbmargin - $width;
        }

        &.after {
          left: $thumbwidth + $thumbmargin - $width;
        }
      }
    }
  }
</style>

<ActionPane bind:actionHeight />

<div
  style="top: {$layout.headerHeight + actionOffset}px; bottom: {$layout.footerHeight}px; right:
  {$layout.sidebarWidth}px;"
  class="doc"
  bind:this={container}
  bind:clientWidth={containerWidth}
  bind:clientHeight={containerHeight}
  on:scroll={handleScroll}>
  <div
    style="padding-top: {paddingTop}px; padding-bottom: {paddingBottom}px; padding-left: {paddingLeft}px">
    {#each pages as page (`${page.index}-${pageSpecString}`)}
      <span class="item" style="width: {itemWidth}px; height: {itemHeight}px">
        <span
          class="imgwrap"
          class:selected={$layout.modifySelectedMap[page.index]}
          on:click={(e) => select(page.index, e.shiftKey)}>
          <div class="pgnum" class:left={!modify}>p. {page.index + 1}</div>
          <Image
            src={pageImageUrl($viewer.document, page.pg, 140)}
            delay={50} />
          {#if modify}
            <div class="selector" />
            {#if showInserts}
              <div class="insert before" />
              {#if page.index == pageCount - 1}
                <div class="insert after" />
              {/if}
            {/if}
          {/if}
        </span>
      </span>
      {#if page.index % itemsPerRow == itemsPerRow - 1}<br />{/if}
    {/each}
  </div>
</div>
