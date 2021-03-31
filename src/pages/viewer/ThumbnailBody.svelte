<script>
  import Image from "@/common/Image";
  import ActionPane from "./pane/ActionPane";
  import { layout } from "@/viewer/layout";
  import { viewer } from "@/viewer/viewer";
  import { pageImageUrl } from "@/api/viewer";
  import { restorePosition, changeMode } from "@/viewer/document";
  import { ModificationSpec } from "@/viewer/modification/modifySpec";
  import { modification } from "@/viewer/modification/modification";
  import Modification from "@/viewer/modification/Modification";

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
  $: {
    if (
      $modification.modifySpec == null &&
      $viewer.document != null &&
      $viewer.document.pageCount != null
    ) {
      // Init page spec
      modification.initSpec(
        ModificationSpec.getDocument($viewer.document.pageCount),
      );
    }
  }
  $: startPage =
    itemsPerRow == null
      ? null
      : Math.min(
          Math.floor(containerScrollTop / itemHeight) * itemsPerRow,
          $modification.pageCount,
        );
  $: endPage =
    itemsPerRow == null || containerHeight == null
      ? null
      : Math.min(
          Math.ceil((containerScrollTop + containerHeight) / itemHeight) *
            itemsPerRow,
          $modification.pageCount,
        );
  $: overallHeight =
    itemsPerRow == null
      ? null
      : Math.ceil($modification.pageCount / itemsPerRow) * itemHeight;
  $: paddingBottom =
    overallHeight == null || endPage == null || itemsPerRow == null
      ? 0
      : overallHeight - Math.ceil(endPage / itemsPerRow) * itemHeight;
  $: pages =
    startPage == null ||
    endPage == null ||
    itemsPerRow == null ||
    $modification.modifySpec == null
      ? []
      : $modification.modifySpec
          .slice(startPage, endPage - startPage + 1)
          .toDescriptors()
          .map((descriptor, i) => ({
            descriptor,
            pg: descriptor.pageSpec.specs[0].pg,
            index: i + startPage,
            document: descriptor.id || $viewer.document,
          }));

  $: showInserts = !$modification.modifyHasSelection;
  $: insertOnly = $modification.hasCopyBuffer;

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

    selectState = selectState || !$modification.modifySelectedMap[page];
    if (selectState) {
      if (shift && lastSelected != null) {
        // Shift selection
        if (lastSelected < page) {
          // Forwards selection
          for (let i = lastSelected + 1; i < page; i++) {
            $modification.modifySelectedMap[i] = true;
          }
        } else {
          // Backwards selection
          for (let i = lastSelected - 1; i > page; i--) {
            $modification.modifySelectedMap[i] = true;
          }
        }
      }
      lastSelected = page;
    } else {
      lastSelected = null;
    }
    $modification.modifySelectedMap = {
      ...$modification.modifySelectedMap,
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
      object-fit: contain;
    }

    .item {
      display: inline-block;
      overflow: visible;
    }

    .imgwrap {
      margin: $thumbmargin;
      display: inline-block;
      position: relative;
      box-sizing: border-box;

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
        cursor: pointer;
      }

      &.selected {
        .selector {
          background: $primary;
          border: 3px solid #bcd7ff;
        }
      }

      .img {
        display: inline-block;
        border: solid 2px transparent;
        box-sizing: border-box;
        background: white;
        outline: $normaloutline;
        box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.12);
        width: 100%;
        height: 100%;
        position: relative;
        cursor: pointer;
        &:hover {
          border: solid 2px $primary;
        }

        &.disabled {
          pointer-events: none;
          opacity: 0.4;
        }
      }

      &.selected {
        .img {
          border: solid 2px $primary;

          &:after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba($primary, 0.5);
            pointer-events: none;
          }
        }
      }

      .insert {
        $width: 2px;
        position: absolute;
        top: 0;
        bottom: 0;
        border: $width dashed rgba(0, 0, 0, 0.1);
        cursor: pointer;

        &:after {
          // Extra width for hover region
          content: "";
          position: absolute;
          top: 0;
          left: -7px;
          right: -7px;
          bottom: 0;
        }

        &:hover {
          border: $width dashed $primary;
        }

        &.emphasized {
          border: $width dashed $primary;

          &:hover {
            opacity: 0.8;
          }
        }

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
  style="top: {$layout.headerHeight +
    actionOffset}px; bottom: {$layout.footerHeight}px; right:
  {$layout.sidebarWidth}px;"
  class="doc"
  bind:this={container}
  bind:clientWidth={containerWidth}
  bind:clientHeight={containerHeight}
  on:scroll={handleScroll}
>
  <div
    style="padding-top: {paddingTop}px; padding-bottom: {paddingBottom}px; padding-left: {paddingLeft}px"
  >
    {#each pages as page (`${page.index}-${JSON.stringify(page.descriptor.json())}`)}
      <span class="item" style="width: {itemWidth}px; height: {itemHeight}px">
        <span
          class="imgwrap"
          class:selected={$modification.modifySelectedMap[page.index]}
        >
          <div class="pgnum" class:left={!modify}>p. {page.index + 1}</div>
          {#if modify}
            {#if !insertOnly}
              <div
                class="selector"
                on:click={(e) => select(page.index, e.shiftKey)}
              />
            {/if}
            {#if showInserts}
              <div
                on:click={() => modification.selectInsert(page.index)}
                class="insert before"
                class:emphasized={(insertOnly && !$modification.hasInsert) ||
                  $modification.insert == page.index}
              />
              {#if page.index == $modification.pageCount - 1}
                <div
                  on:click={() => modification.selectInsert(page.index + 1)}
                  class="insert after"
                  class:emphasized={(insertOnly && !$modification.hasInsert) ||
                    $modification.insert == page.index + 1}
                />
              {/if}
            {/if}
          {/if}
          <Modification descriptor={page.descriptor}>
            <span
              class="img"
              class:disabled={insertOnly}
              on:click={(e) => select(page.index, e.shiftKey)}
            >
              <Image
                src={pageImageUrl(page.document, parseInt(page.pg), 140)}
                delay={50}
              />
            </span>
          </Modification>
        </span>
      </span>
      {#if page.index % itemsPerRow == itemsPerRow - 1}<br />{/if}
    {/each}
  </div>
</div>
